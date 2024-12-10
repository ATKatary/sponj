import scipy 
import numpy as np
import scipy.linalg
import scipy.sparse
from tqdm import tqdm
from time import time
from uuid import uuid4
from utils import TMP_DIR
import scipy.sparse.linalg 
from utils.mesh import SponjMesh 
from scipy.cluster.vq import kmeans2
from utils.segment.mesh_graph import mesh_to_graph

class SegmentedSponjMesh(SponjMesh):
    def __init__(self, obj_path: str = None, glb_path: str = None, faces=None, vertices=None, extract_colors=True):
        super().__init__(obj_path, glb_path, faces, vertices, extract_colors)
        
        self.graph = mesh_to_graph(self)
        self.graph_faces = self.graph.get_face_matrix()

        self.adj_matrix = None
        self.segmentations = {}
        self.degree_matrix = None
        self.ang_dist_matrix = None
        self.geo_dist_matrix = None
        self.similarity_matrix = None
    
        self.compute_face_face_adj()

    def compute_face_face_adj(self):
        self.graph_faces = self.graph.get_face_matrix()

        v_to_f = {i: [] for i in range(len(self.vertices))}
        for i, face in enumerate(self.graph_faces):
            for j in face:
                for v in self.faces[j]:
                    v_to_f[v].append(i)
        
        self.face_face_adj = [[] for _ in range(len(self.graph_faces))]
        for v in v_to_f:
            for f in v_to_f[v]:
                self.face_face_adj[f] += v_to_f[v]
    
    def unroll_graph_face(self, graph_face):
        return [j for i in graph_face for j in self.faces[i]]
    
    def coords(self, faces):
        return np.array([self.vertices[i] for i in self.unroll_graph_face(faces)])
    
    def normal(self, face):
        normal = 0
        for i in face:
            normal += self.face_normals[i]
        return normal / len(face)

    def geo_dist(self, i, j):
        """ Returns the geodesic distance between faces i and j """
        if i == j: return None
        
        face_i = self.unroll_graph_face(self.graph_faces[i])
        face_j = self.unroll_graph_face(self.graph_faces[j])

        edge = [self.vertices[i] for i in list(set(face_i) & set(face_j))]
        if len(edge) <= 1: return 
        
        edge_center = np.mean(edge, axis=0)
        return np.linalg.norm(edge_center - self.coords(face_i).mean(0)) + np.linalg.norm(edge_center - self.coords(face_j).mean(0))

    def ang_dist(self, i, j, eta = 0.15):
        """ Computes the angular distance between face_1 and face_2 = η * (1 - cos(α(fi, fj))); η = 1 for α >= 180 and η -> 0 for α < 180"""
        face_i = self.coords(self.graph_faces[i])
        normal_i = self.normal(self.graph_faces[i])

        face_j = self.coords(self.graph_faces[j])
        normal_j = self.normal(self.graph_faces[j])
        
        cos_alpha = np.dot(normal_i, normal_j) / np.linalg.norm(normal_i) / np.linalg.norm(normal_j)
        
        if not np.all(normal_i.dot(face_i.mean() - face_j.mean())) < 0: eta = 1
        return eta * (1 - cos_alpha)
    
    def compute_geo_dist_matrix(self):
        self.log(f"[SegmentedSponjMesh][compute_geo_dist_matrix] >> Computing geodesic distances ...")
        
        if self.geo_dist_matrix is None: 
            (self.geo_dist_matrix, self.avg_geo_dist) = self.compute_dist_matrices([self.geo_dist])
        return self.geo_dist_matrix

    def compute_ang_dist_matrix(self):
        self.log(f"[SegmentedSponjMesh][compute_ang_dist_matrix] >> Computing angular distances ...")
        
        if self.ang_dist_matrix is None: 
            (self.ang_dist_matrix, self.avg_ang_dist) = self.compute_dist_matrices([self.ang_dist])
        return self.ang_dist_matrix

    def compute_all_dist_matrices(self):
        self.log(f"[SegmentedSponjMesh][compute_all_dist_matrices] >> Computing geodesic and angular distances ...")
        
        if self.geo_dist_matrix is None and self.ang_dist_matrix is None:
            (self.geo_dist_matrix, self.avg_geo_dist), \
            (self.ang_dist_matrix, self.avg_ang_dist) = self.compute_dist_matrices([self.geo_dist, self.ang_dist])
        return self.compute_geo_dist_matrix(), self.compute_ang_dist_matrix()
    
    def compute_dist_matrices(self, dist_fns):
        dist_matrices = []
        n = len(self.face_face_adj)

        total_edges = 0
        for k in range(len(dist_fns)):
            dist_fn = dist_fns[k]
            dist_matrix = np.zeros((n, n))
            
            for i in range(n):
                for j in self.face_face_adj[i]:
                    dist = dist_fn(i, j)
                    if dist is not None:
                        total_edges += 1
                        dist_matrix[i, j] = dist
            dist_matrices.append((dist_matrix, dist_matrix.sum() / (total_edges / 2)))
        return dist_matrices
    
    def compute_adj_matrix(self, delta = 0.03):
        self.log(f"[SegmentedSponjMesh][compute_adj_matrix] >> Computing adjacency matrix ...")
        
        if self.adj_matrix is None:
            self.adj_matrix = self.geo_dist_matrix.copy()
            self.adj_matrix *= delta / self.avg_geo_dist
            self.adj_matrix += (1 - delta) * self.ang_dist_matrix.copy() / self.avg_ang_dist

        return self.adj_matrix

    def compute_degree_matrix(self):
        self.log(f"[SegmentedSponjMesh][compute_degree_matrix] >> Computing degree matrix ...")
        
        if self.degree_matrix is None: 
            self.degree_matrix = np.reciprocal(self.adj_matrix.sum(1))
        return self.degree_matrix
    
    def compute_similarity_matrix(self):
        self.log(f"[SegmentedSponjMesh][compute_similarity_matrix] >> Computing similarity matrix ...")
        
        if self.similarity_matrix is None:
            self.similarity_matrix = scipy.sparse.csgraph.dijkstra(self.adj_matrix)
            inf_indices = np.where(np.isinf(self.similarity_matrix))
            self.similarity_matrix[inf_indices] = 0
            
            sigma = self.similarity_matrix.mean()
            np.exp(-self.similarity_matrix / (2 * (sigma ** 2)))
            np.fill_diagonal(self.similarity_matrix, 1)
        return self.similarity_matrix

    def predict_segment_count(self, laplacian):
        self.log(f"[SegmentedSponjMesh][predict_segment_count] >> Predicting segment count ...")

        eigen_full, _ = scipy.linalg.eigh(laplacian)
        eigen_full = np.sort(eigen_full)
        eigen_std = np.std(eigen_full)
        return len([abs(eigen_full[i] - eigen_full[i - 1]) for i in range(1, len(eigen_full)) if abs(eigen_full[i] - eigen_full[i - 1]) >= eigen_std])
    
    def unwrap_labels(self, labels):
        graph_faces = self.graph.get_face_matrix()
        unwrapped_labels = np.zeros(self.face_shape[0])

        for i in range(len(labels)):
            for j in graph_faces[i]:
                unwrapped_labels[j] = labels[i]
        return unwrapped_labels

    def segment(self, n = None, k = 0):
        if n in self.segmentations:
            return np.loadz(self.segmentations[n])['labels']
        
        start_time = time() 
        if k > 0:
            self.graph = self.graph.collapse(k)
            self.compute_face_face_adj()
        
        self.compute_all_dist_matrices()
        self.compute_adj_matrix()

        self.log(f"[SegmentedSponjMesh][segment] (avg_geo_dist) = {self.avg_geo_dist}")
        self.log(f"[SegmentedSponjMesh][segment] (avg_ang_dist) = {self.avg_ang_dist}")
        
        self.compute_similarity_matrix()
        self.compute_degree_matrix()

        sqrt_degree = np.sqrt(self.degree_matrix)
        laplacian = sqrt_degree.T * self.similarity_matrix.T * sqrt_degree

        if n is None:
            n = self.predict_segment_count(laplacian)
            self.log(f"[SegmentedSponjMesh][segment] >> Predicted segment count: {n}")
            
        eigen_values, eigen_vectors = scipy.sparse.linalg.eigsh(laplacian)
        eigen_vectors /= np.linalg.norm(eigen_vectors, axis=1)[:, None]

        _, labels = kmeans2(eigen_vectors, n, minit="++", iter=50)
        if k > 0:
            labels = self.unwrap_labels(labels)

        labels_path = f"{TMP_DIR}/{uuid4()}.npz"
        np.savez(labels_path, labels=labels)

        self.segmentations[n] = labels_path
        end_time = time()

        duration = end_time - start_time
        self.log(f"[SegmentedSponjMesh][segment] >> Segmentated mesh into {n} segments in {duration} seconds")
        return labels.tolist(), n, duration


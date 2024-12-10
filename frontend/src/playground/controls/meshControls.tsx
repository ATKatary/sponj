// custom imports
import { selector } from '../state';
import '../../assets/css/controls.css'; 
import { usePlaygroundStore } from '../state/store';

// third party
import { useShallow } from 'zustand/shallow';

type MeshControlsProps = JSX.IntrinsicElements['div'] & {
}

export function MeshControls({...props}: MeshControlsProps) {
    const { tool, meshes, selected } = usePlaygroundStore(useShallow(selector))

    return (
        <div id="mesh-controls">
             
        </div>
    )
}
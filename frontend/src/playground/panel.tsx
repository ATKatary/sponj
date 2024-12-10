// custom imports
import { meshType } from './types';
import { selector } from './state';
import { usePlaygroundStore } from './state/store';

// third party
import { useShallow } from 'zustand/shallow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useState } from 'react';

type PlaygroundPanelProps = JSX.IntrinsicElements['div'] & {
}

export function PlaygroundPanel({...props}: PlaygroundPanelProps) {
    const { meshes, selected, setSelected } = usePlaygroundStore(useShallow(selector))

    return (
        <div className="playground-panel">
            <h3><b>Layers</b></h3>
            {meshes.map(mesh => <MeshLayers key={`${mesh.id}-layers`} mesh={mesh} />)}
        </div>
    )
}

type MeshLayersProps = JSX.IntrinsicElements['div'] & {
    mesh: meshType
    btnStyle?: React.CSSProperties
}

function MeshLayers({mesh: {id, segments, gif, title, ...mesh}, btnStyle, ...props}: MeshLayersProps) {
    const [collapsed, setCollapsed] = useState(false)
    const { setSelected } = usePlaygroundStore(useShallow(selector))

    const hasSegments = segments.length > 0

    return (
        <div className="mesh-layer" {...props}>
            <div className='flex align-center'>
                {hasSegments && <FontAwesomeIcon 
                    className="dropdown-caret pointer"
                    onClick={() => setCollapsed(!collapsed)}
                    icon={`fa-solid fa-caret-${collapsed ? "down" : "right"}` as IconProp} 
                />}
                <button 
                    style={{...btnStyle}}
                    className='mesh-layer-btn flex align-center'
                    onClick={() => { 
                        setSelected(id)
                        setCollapsed(!collapsed)
                    }}
                >
                    {gif && <img src={gif} height={20} />}
                    <h3 style={{marginLeft: gif ? 10 : 0}}>{title}</h3>
                </button>
            </div>
            {hasSegments && collapsed && segments.map((segment, i) => {
                return (
                    <MeshLayers 
                        mesh={segment} 
                        btnStyle={{marginLeft: 20, width: "calc(100% - 30px)"}}
                        key={`${segment.id}-layers`} 
                    />
                )
            })}
        </div>
    )
}
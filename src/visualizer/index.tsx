import {useParams} from 'react-router-dom'
import { useState } from 'react'
import PacketContainer from './packetContainer'
import NodeMap from './nodeMap'
import { PacketSortOptions as PacketSort, PACKET_PAGE_SIZE} from '../common/Constants'
import PacketViewSettingsModal from './modals/PacketViewSettingsModal'
import PacketViewSettingsState from './modals/PacketViewSettingsState'
import Menubar from '../components/Menubar';
import APIUtil from '../utilities/APIutils'
import PacketState from './packetContainer/PacketState'
import './index.css'
import './modals/index.css'
import EditNodeModal from './modals/EditNodeModal'

function Visualizer() {
    const projectId = useParams().projectId!

    const api = new APIUtil()

    // Modal for changing packet view settings
    let [isShownPacketsModal, setIsShownPacketsModal] = useState(false)
    let [packetViewSettings, setPacketViewSettings] = useState<PacketViewSettingsState>({
        size: PACKET_PAGE_SIZE,
        before: undefined,
        after: undefined,
        node: undefined,
        sort: PacketSort.TIME_DESC
    })
    const showPacketViewSettingsModal = () => setIsShownPacketsModal(true)
    const hidePacketViewSettingsModal = () => setIsShownPacketsModal(false)

    // Packet retrieval and infinite list
    let [packetList, setPacketList]: Array<any> = useState([])
    let [hasMorePackets, setHasMorePackets] = useState(true)
    const renderPackets = packetList.map((packet: PacketState) => {
        return (
            <tr key={packet._id}>
                <td>{packet.timestamp.toUpperCase()}</td>
                <td>{packet.nodeId.toUpperCase()}</td>
                <td>{packet.type.toUpperCase()}</td>
                <td>{packet.data.toUpperCase()}</td>
            </tr>
        )
    })
    const fetchPackets = () => {
        const lastPacket: PacketState | undefined = packetList.length > 0 ? packetList[packetList.length - 1] : null
        const viewSettings: PacketViewSettingsState = {
            size: packetViewSettings.size,
            before: packetViewSettings.before,
            after: lastPacket ? lastPacket.timestamp : undefined,
            node: packetViewSettings.node,
            sort: packetViewSettings.sort
        }
        api.getPackets(
            viewSettings,
            projectId,
            (response: any) => { // On success
                const newPackets = response.data
                if (newPackets.length > 0) {
                    // Append to list
                    setPacketList(packetList.concat(newPackets))
                } else {
                    setHasMorePackets(false)
                }
            },
            (error: any) => { // On failure
                console.log(error)
                return
            }
        )
    }
    const refreshPackets = () => {
        api.getPackets(
            packetViewSettings,
            projectId,
            (response: any) => { // On success
                const newPackets = response.data
                if (newPackets.length > 0) {
                    // Append to list
                    setPacketList(newPackets)
                } else {
                    setHasMorePackets(false)
                }
            },
            (error: any) => { // On failure
                console.log(error)
                return
            }
        )
        let elem = document.getElementById('packet-table')
        elem?.scrollTo(0, 0)
    }
    const onPlay = (play: boolean) => {
        api.gatherTraffic(play, projectId)
    }

    
    // Other stuff
    
    return (
        <div className='visualizer'>
            {/* <PacketViewSettingsModal
                isShown={isShownPacketsModal}
                setHide={hidePacketViewSettingsModal}
                packetViewSettings={packetViewSettings}
                setPacketViewSettings={setPacketViewSettings}
            /> */}
            <EditNodeModal></EditNodeModal>
            <h1 className='visualizer-title'>{projectId}</h1>
            <Menubar
                showPacketViewSettingsModal={showPacketViewSettingsModal}
                hidePacketViewSettingsModal={hidePacketViewSettingsModal}
            />
            <div className='visualizer-content'>
                <div className='packet-container-content'>
                    <PacketContainer
                    fetchData={fetchPackets}
                    hasMore={hasMorePackets}
                    packetList={renderPackets}
                    refresh={refreshPackets}
                    onPlay={onPlay}
                    />
                </div>
                <div className='node-map-container-content'>
                    <NodeMap></NodeMap>
                </div>
            </div>
        </div>
    )
}

export default Visualizer
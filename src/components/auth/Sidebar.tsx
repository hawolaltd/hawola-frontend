import React from 'react';
import Dashboard from "@/components/svg/Dashboard";

const items = [
    {
       icon: <Dashboard/>,
        type: 'custom'
    },
    {
       icon: "/imgs/template/monitor.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/mobile.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/game.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/clock.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/airpods.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/mouse.svg",
        type: 'image'
    },

    {
       icon: "/imgs/template/music-play.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/bluetooth.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/bluetooth.svg",
        type: 'image'
    },

    {
       icon: "/imgs/template/electricity.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/cpu.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/devices.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/driver.svg",
        type: 'image'
    },
    {
       icon: "/imgs/template/airpod.svg",
        type: 'image'
    },
]

function Sidebar() {
    return (
        <ul className={'flex flex-col gap-7 h-screen overflow-x-hidden  px-4 pt-8 w-full'}>
            {
                items.map((item, key) => (
                    <li key={key} className={'cursor-pointer'}>
                        {item.type === 'image' ? <img src={item.icon as string} alt={'icon'}/> : item.icon }
                    </li>
                ))
            }
        </ul>
    );
}

export default Sidebar;
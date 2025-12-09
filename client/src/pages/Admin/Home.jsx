
import Graph from '../../assets/compliants_graph.svg?react'
import GroupIcon from '../../assets/icons/group_icon.svg?react'
import ClockIcon from '../../assets/icons/clock_icon.svg?react'
import CalenderIcon from '../../assets/icons/calender_icon.svg?react'
import CheckmarkIcon from '../../assets/icons/checkmark_icon.svg?react'
import GraphIcon from '../../assets/icons/graph_icon.svg?react'
import ChartArrowIcon from '../../assets/icons/chart_arrow.svg?react'
import LocationIcon from '../../assets/icons/location_icon.svg?react'


import ArrowUpRightIcon from '../../assets/arrow_up_right.svg?react'

import { LineChart, Line, ResponsiveContainer,  XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Status from '../../components/ui/Status.jsx'

function Home() {

  const list = [
    {title: 'Total Employees', stat: 258, icon: GroupIcon},
    {title: 'Pending Requests', stat: 24, icon: ClockIcon},
    {title: 'Active Events', stat: 12, icon: CalenderIcon},
    {title: 'Resolved Compliants', stat: 376, icon: GroupIcon},
  ]

  const data = [
  { day: "01", thisMonth: 30,  lastMonth: 90  },
  { day: "03", thisMonth: 50,  lastMonth: 120 },
  { day: "06", thisMonth: 50,  lastMonth: 90 },
  { day: "08", thisMonth: 150, lastMonth: 30 },
  { day: "10", thisMonth: 90, lastMonth: 120 },
  { day: "12", thisMonth: 180, lastMonth: 70 },
  { day: "16", thisMonth: 150, lastMonth: 210 },
  { day: "20", thisMonth: 160, lastMonth: 130 },
  { day: "24", thisMonth: 40, lastMonth: 80 },
  { day: "28", thisMonth: 140, lastMonth: 115 },
  { day: "31", thisMonth: 80, lastMonth: 100 },


]

  return (
      <div className=' grid grid-cols-[1fr_350px] '>
      <div className=' rounded-xl grid grid-rows-[400px_1fr] gap-5 ' >

        <div className='w-full h-100 flex flex-col justify-around pr-5 border-2 border-[#E0E0E0] rounded-xl' >

          <div className=' h-30 flex flex-col justify-around px-5 font-roboto ' >
            <div className='flex items-center gap-2' >
              <GraphIcon className="text-red-500" />
              <h1 className='font-medium text-3xl' >Compliants</h1>
            </div>
 
            <div className='flex justify-between' >

              <div className='flex items-end gap-3' >
                  <h1 className='text-4xl font-medium ' >468</h1>
                  <p className='flex gap-2 items-center text-green-400 text-sm' >
                    <ChartArrowIcon/> 22.48%
                  </p>
              </div>

              <div className='flex items-center gap-4' >

                <div className='px-4 py-1 bg-[#3A3A3A] text-white text-sm rounded-full ' >January</div>
                
                <div className='flex items-center gap-2' >
                  <div className='w-3 h-3 bg-[#AEAEB2] rounded-full' />
                  <p>This month</p>
                </div>
                
                <div className='flex items-center gap-2' >
                  <div className='w-3 h-3 bg-[#3A3A3A] rounded-full' />
                  <p>Last month</p>
                </div>
  
                
              </div>
              
            </div>
            
          </div>

          <div className='w-full h-60 ' >

          <ResponsiveContainer width="100%" height="100%" >
            <LineChart data={data} >
            <XAxis dataKey="day" axisLine={{stroke: '#D0D0D0', strokeWidth: 2}} tickLine={{stroke: '#D0D0D0', strokeWidth: 2}} />
                <YAxis axisLine={{ stroke: '#D0D0D0', strokeWidth: 2 }} tickLine={{ stroke: '#D0D0D0', strokeWidth: 2 }} />
            <CartesianGrid stroke='#E0E0E0' strokeDasharray='4 4' />
            <Tooltip />
            <Line type="monotone" dataKey="thisMonth" stroke="#D1D5DB" strokeWidth={4} dot={false} />
            <Line type="monotone" dataKey="lastMonth" stroke="#000" strokeWidth={4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
            
          </div>

        </div>

        <div className='h-full  grid grid-cols-4 gap-3 ' >

          <div className='border h-50 rounded-xl cursor-pointer hover:scale-101 transition-all' ></div>

          <div className='bg-[#3A3A3A] border-2 border-gray-500 text-white font-roboto h-50 col-span-2 rounded-xl flex flex-col justify-around relative px-3 cursor-pointer hover:scale-101 transition-all ' >

            <button className='absolute top-0 right-0 bg-white w-14 h-14 rounded-tr-xl rounded-bl-xl flex justify-center items-center ' >
              <ArrowUpRightIcon className="text-black w-10 h-10 " />
            </button>

            <h1 className='text-2xl font-bold' >Community Clean-Up Day</h1>
            <p className='font-extralight' >A coordinated neighborhood clean-up to improve local sanitation and promote community participation prepared an organized by lideta officials.</p>

            <div className='flex justify-around items-center text-xs ' >

              <Status status={'upcoming'} />

              <div className='flex items-center gap-2 bg-[#555555] py-1 px-2 rounded-md ' >
                <CalenderIcon className="w-4 h-4" />
                <p>Dec 12, 2025</p>
              </div>

              <div className='flex items-center gap-2 bg-[#555555] py-1 px-2 rounded-md ' >
                <LocationIcon className="w-4 h-4" />
                <p>Sar Bet Area, Lideta Sub-City</p>
              </div>

            </div>

          </div>

          <div className='border h-50 rounded-xl cursor-pointer hover:scale-101 transition-all ' ></div>

        </div>

      </div>

        <div className=' px-2' >
          <div className='w-80 h-full bg-[#F0F0F0] rounded-xl flex flex-col items-center py-10 space-y-4' >

            {list.map(list => {
              return (
                  <div className='w-[95%] h-18 bg-white rounded-xl flex items-center px-4 gap-6 font-roboto ' >

                    <list.icon className="w-7 h-7" />
                    <div className='flex-1 flex flex-col justify-center h-full' >
                    <p>{ list.title }</p>
                    <h1 className=' font-bold text-2xl' >{ list.stat }</h1>
                    </div>

                  </div>
              )
            })

            }

          </div>
        </div>
      </div>
  )
}

export default Home
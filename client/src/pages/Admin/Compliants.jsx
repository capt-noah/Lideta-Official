import { useState } from 'react'
import ChartArrowIcon from '../../assets/icons/chart_arrow.svg?react'
import EditIcon from '../../assets/icons/edit_icon.svg?react'
import ImageIcon from '../../assets/icons/image_icon.svg?react'

import StatusSection from '../../components/ui/Status.jsx'
import Upload from '../../components/ui/Upload.jsx'

function Compliants() {
  const [activeTab, setActiveTab] = useState('compliant')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    compliantType: '',
    status: '',
    compliant: '',
    photo: null
  })

  const compliantStats = [
    {title: 'Total Compliants', stat: 258, percentage: 2.01},
    {title: 'Pending Compliants', stat: 24, percentage: 53.01},
    {title: 'Resolved Compliants', stat: 376, percentage: 14.52},
  ]

  const compliantsList = [
    {
      id: 1,
      firstName: 'Mulugeta',
      lastName: 'Kebede',
      fullname: 'Mulugeta Kebede',
      email: 'mulukebede@gmail.com',
      phoneNumber: '0912345678',
      month: '01',
      day: '14',
      type: 'sanitation',
      status: 'assigning',
      compliant: 'I would like to report an issue regarding the sanitation conditions in our office area. For the past week, the trash bins have not been emptied regularly, causing an unpleasant smell and attracting insects. The restroom near the main hall is also not being cleaned properly.',
      photo: {name: 'attachedphoto.png'}
    },
    {
      id: 2,
      firstName: 'Rahel',
      lastName: 'Tesfaye',
      fullname: 'Rahel Tesfaye',
      email: 'raheltesfaye@gmail.com',
      phoneNumber: '0912345679',
      month: '02',
      day: '02',
      type: 'water & sewer',
      status: 'in progress',
      compliant: '',
      photo: null
    },
    {
      id: 3,
      firstName: 'Abel',
      lastName: 'Haile',
      fullname: 'Abel Haile',
      email: 'abelhaile@gmail.com',
      phoneNumber: '0912345680',
      month: '12',
      day: '28',
      type: 'infrastructure',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 4,
      firstName: 'Lidiya',
      lastName: 'Tsegaye',
      fullname: 'Lidiya Tsegaye',
      email: 'lidyatsegaye@gmail.com',
      phoneNumber: '0912345681',
      month: '01',
      day: '29',
      type: 'housing & land',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 5,
      firstName: 'Solomon',
      lastName: 'Fikre',
      fullname: 'Solomon Fikre',
      email: 'solomonfikre@gmail.com',
      phoneNumber: '0912345682',
      month: '01',
      day: '07',
      type: 'customer service',
      status: 'assigning',
      compliant: '',
      photo: null
    },
    {
      id: 6,
      firstName: 'Hana',
      lastName: 'Berhanu',
      fullname: 'Hana Berhanu',
      email: 'hanaberhanu@gmail.com',
      phoneNumber: '0912345683',
      month: '02',
      day: '10',
      type: 'Finance',
      status: 'in progress',
      compliant: '',
      photo: null
    },
    {
      id: 7,
      firstName: 'Bereket',
      lastName: 'Yonas',
      fullname: 'Bereket Yonas',
      email: 'bereketyonas@gmail.com',
      phoneNumber: '0912345684',
      month: '07',
      day: '28',
      type: 'public health',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 8,
      firstName: 'Saron',
      lastName: 'Mekonnen',
      fullname: 'Saron Mekonnen',
      email: 'saronmekonnen@gmail.com',
      phoneNumber: '0912345685',
      month: '04',
      day: '12',
      type: 'sanitation',
      status: 'in progress',
      compliant: '',
      photo: null
    },
    {
      id: 9,
      firstName: 'Meron',
      lastName: 'Haileselassie',
      fullname: 'Meron Haileselassie',
      email: 'meronhaileselassie@gmail.com',
      phoneNumber: '0912345686',
      month: '11',
      day: '21',
      type: 'sanitation',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 10,
      firstName: 'Dawit',
      lastName: 'Tesfaw',
      fullname: 'Dawit Tesfaw',
      email: 'dawittesfaw@gmail.com',
      phoneNumber: '0912345687',
      month: '11',
      day: '20',
      type: 'customer service',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 11,
      firstName: 'Feven',
      lastName: 'Tsegaye',
      fullname: 'Feven Tsegaye',
      email: 'feventsegaye@gmail.com',
      phoneNumber: '0912345688',
      month: '09',
      day: '22',
      type: 'Maintenance',
      status: 'resolved',
      compliant: '',
      photo: null
    },
    {
      id: 12,
      firstName: 'Nahom',
      lastName: 'Berhanu',
      fullname: 'Nahom Berhanu',
      email: 'nahomberhanu@gmail.com',
      phoneNumber: '0912345689',
      month: '04',
      day: '18',
      type: 'service delay',
      status: 'in progress',
      compliant: '',
      photo: null
    },
    {
      id: 13,
      firstName: 'Eden',
      lastName: 'Asfaw',
      fullname: 'Eden Asfaw',
      email: 'edenasfaw@gmail.com',
      phoneNumber: '0912345690',
      month: '06',
      day: '12',
      type: 'sanitation',
      status: 'assigning',
      compliant: '',
      photo: null
    },
  ]

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setActiveTab('compliant')
    setFormData({
      firstName: complaint.firstName,
      lastName: complaint.lastName,
      email: complaint.email,
      phoneNumber: complaint.phoneNumber,
      compliantType: complaint.type,
      status: complaint.status,
      compliant: complaint.compliant,
      photo: complaint.photo
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }



  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      compliantType: '',
      status: '',
      compliant: '',
      photo: null
    })
    setSelectedComplaint(null)
  }

  const handleCreate = () => {
    // Handle create/update logic here
    console.log('Form data:', formData)
    handleReset()
  }

  return (
    <div className='grid grid-cols-[1fr_500px] gap-4 p-4'>
      <div className='grid grid-rows-[120px_1fr] gap-4'>
        {/* Stats Cards */}
        <div className='flex justify-between items-center'>
          {compliantStats.map((com, index) => (
            <div key={index} className='w-60 h-full border rounded-xl font-roboto flex flex-col justify-around px-4'>
              <p className='text-lg font-medium'>{com.title}</p>
              <h1 className='text-4xl font-mono font-bold'>{com.stat}</h1>
              <div className='flex items-center gap-2'>
                  <ChartArrowIcon />
                <p className='text-[#71DD8C] text-xl'>{com.percentage}%</p>
                <p className='text-gray-400 text-xs'>since last month</p>
              </div>
            </div>
          ))}
        </div>

        {/* Complaint Form/Details Section */}
        <div className='bg-white border rounded-xl font-jost p-5'>
          {/* Tabs */}
          <div className='flex gap-2 mb-5'>
            <button
              onClick={() => {
                setActiveTab('compliant')
                if (!selectedComplaint) {
                  handleReset()
                }
              }}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer ${
                activeTab === 'compliant'
                  ? 'bg-[#3A3A3A] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              compliant
            </button>
            <button
              onClick={() => {
                setActiveTab('new compliant')
                handleReset()
              }}
              className={`px-4 py-2 rounded-md font-medium border cursor-pointer ${
                activeTab === 'new compliant'
                  ? 'bg-[#3A3A3A] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              new compliant
            </button>
                </div>
              
          {/* Form Fields */}
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  First name
                </label>
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder='Enter first name'
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Last name
                </label>
                <input
                  type='text'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder='Enter last name'
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='Enter email'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Phone number
              </label>
              <input
                type='tel'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder='Enter phone number'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Compliant type
              </label>
              <input
                type='text'
                name='compliantType'
                value={formData.compliantType}
                onChange={handleInputChange}
                placeholder='Enter compliant type'
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
              />
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A]'
                >
                  <option value=''>Select status</option>
                  <option value='assigning'>assigning</option>
                  <option value='in progress'>in progress</option>
                  <option value='resolved'>resolved</option>
                </select>
              </div>
              {selectedComplaint && (
                <button className='mt-6 px-4 py-2 bg-[#3A3A3A] rounded-md hover:bg-[#444444] flex items-center gap-2 cursor-pointer'>
                  <EditIcon className='w-4 h-4 text-white' />
                  <span className='text-sm text-white '>Edit</span>
                </button>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Attached photo
              </label>
              <div className=' rounded-md p-2 flex flex-col items-center justify-center min-h-[120px]'>

                <Upload photo={formData.photo} setFormData={setFormData} />


              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Compliant
              </label>
              <textarea
                name='compliant'
                value={formData.compliant}
                onChange={handleInputChange}
                placeholder='Enter compliant here'
                rows={6}
                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3A3A3A] resize-none'
              />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <button
                onClick={handleReset}
                className='px-6 py-2  text-gray-700 rounded-full shadow-md shadow-gray-400 hover:bg-gray-100 font-medium cursor-pointer active:scale-98'
              >
                Reset
              </button>
              <button
                onClick={handleCreate}
                className='px-6 py-2 bg-[#3A3A3A] text-white rounded-full shadow-md shadow-gray-400 hover:bg-[#2A2A2A] font-medium cursor-pointer active:scale-98 '
              >
                {selectedComplaint ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className='bg-white h-fit border rounded-xl font-jost p-5 space-y-5 overflow-y-auto '>
        <h1 className='text-3xl font-medium'>Compliants</h1>

        <div className='flex gap-2 text-[#818181] text-sm font-medium'>
          <p className='w-[30%]'>Full name</p>
          <p className='w-[15%]'>Date</p>
            <p className='w-[30%]'>Type</p>
            <p className='w-[20%]'>Status</p>
          </div>

        <div className='space-y-3'>
          {compliantsList.map((list) => (
            <div
              key={list.id}
              onClick={() => handleComplaintClick(list)}
              className={`flex flex-col space-y-3 cursor-pointer transition-colors `}>
              <div className='flex items-center gap-2 text-sm'>
                <p className='w-[30%]'>{list.fullname}</p>
                <p className='w-[15%]'>{list.month}-{list.day}</p>
                      <p className='w-[30%]'>{list.type}</p>
                      <StatusSection status={list.status} />
                    </div>
                    <hr className='text-[#DEDEDE]' />    
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Compliants

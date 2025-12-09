import React, { useEffect, useState } from 'react'

import SearchIcon from '../../assets/icons/search_icon.svg?react'


function Search( { data, results, setResults, noResultFound, setNoResultFound }) {

  const searchData = data
  const [searchTerm, setSearchTerm] = useState("")


  useEffect(() => {

    if (searchTerm.trim() == "") {
      setNoResultFound(false)
      setResults(null)
      return
    }

    const searchResults = searchData.filter(data => data.title.toLowerCase().includes(searchTerm.toLowerCase().trim()))

    if (searchResults.length < 1) {
      setNoResultFound(true)
      setResults(null)
      return
    }

   

    setResults(searchResults)
  }, [searchTerm])

  console.log(results)
  console.log(noResultFound)

  return (
    
      <div className='w-80 md:max-w-md h-12 flex items-center bg-white rounded-xl shadow px-4 py-2 space-x-4'>
          <SearchIcon className='w-5' />
          <input
          type='text'
          placeholder='Search'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='flex-1 bg-transparent outline-none font-roboto text-sm'
          />
      </div>

  )
}

export default Search
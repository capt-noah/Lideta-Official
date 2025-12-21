import React, { useEffect, useState } from 'react'

import SearchIcon from '../../assets/icons/search_icon.svg?react'


function Search( { data, results, setResults, noResultFound, setNoResultFound }) {

  const searchData = data
  const [searchTerm, setSearchTerm] = useState("")


  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()

    if (term === "") {
      setNoResultFound(false)
      setResults(null)
      return
    }

    const searchResults = data.filter(item => {
      const enTitle = item.title?.toLowerCase() || ''
      const amTitle = item.amh?.title?.toLowerCase() || ''
      const orTitle = item.orm?.title?.toLowerCase() || ''
      
      // Also search location if available (for Events)
      const enLoc = item.location?.toLowerCase() || ''
      const amLoc = item.amh?.location?.toLowerCase() || ''
      const orLoc = item.orm?.location?.toLowerCase() || ''

      return enTitle.includes(term) || amTitle.includes(term) || orTitle.includes(term) ||
             enLoc.includes(term) || amLoc.includes(term) || orLoc.includes(term)
    })

    if (searchResults.length === 0) {
      setNoResultFound(true)
      setResults([]) // Return empty array instead of null to indicate "Done searching, found nothing"
    } else {
      setNoResultFound(false)
      setResults(searchResults)
    }

  }, [searchTerm, data])


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
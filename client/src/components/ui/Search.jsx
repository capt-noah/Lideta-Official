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
      // Handle title - can be a string or an object with language keys
      let enTitle = ''
      let amTitle = ''
      let orTitle = ''
      
      if (typeof item.title === 'string') {
        // For events, news, vacancies - title is a string
        enTitle = item.title.toLowerCase()
        amTitle = item.amh?.title?.toLowerCase() || ''
        orTitle = item.orm?.title?.toLowerCase() || ''
      } else if (typeof item.title === 'object' && item.title !== null) {
        // For departments - title is an object with language keys
        enTitle = item.title.en?.toLowerCase() || ''
        amTitle = item.title.am?.toLowerCase() || ''
        orTitle = item.title.or?.toLowerCase() || ''
      }
      
      // Also search in name field if available (for departments)
      const enName = item.name?.en?.toLowerCase() || ''
      const amName = item.name?.am?.toLowerCase() || ''
      const orName = item.name?.or?.toLowerCase() || ''
      
      // Also search location if available (for Events)
      const enLoc = typeof item.location === 'string' ? item.location.toLowerCase() : ''
      const amLoc = item.amh?.location?.toLowerCase() || ''
      const orLoc = item.orm?.location?.toLowerCase() || ''

      return enTitle.includes(term) || amTitle.includes(term) || orTitle.includes(term) ||
             enName.includes(term) || amName.includes(term) || orName.includes(term) ||
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
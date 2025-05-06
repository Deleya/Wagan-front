// import { useState } from 'react'
import wagan from './assets/image/wagan.png'

function App() {

  return (
      <div className='w-full h-[100vh] flex justify-center items-center '>
        <div className='flex flex-col gap-5 justify-center items-center'>
          <div className='w-[75px] h-[75px]'>
            <img src={wagan} className="w-full h-full object-cover" alt="Vite logo" />
          </div>
          

          <h1 className='text-5xl font-bold'>Je suis Wagan</h1>
          <h1 className="text-3xl font-bold underline">
            Hello world!
          </h1>
        </div>
        
      </div>
  )
}

export default App

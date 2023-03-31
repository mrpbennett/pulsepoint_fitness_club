import {Listbox, Transition} from '@headlessui/react'
import {
  ExclamationCircleIcon,
  LightningBoltIcon,
  SelectorIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import {Fragment, useEffect, useState} from 'react'
import sportTypes from './data/sportTypes'
import supabase from './modules/supabase'

import PPLogo from './assets/pp-logo.png'

const mainTableHeaders = [
  {id: 1, label: 'Name'},
  {id: 2, label: 'Activity'},
  {id: 3, label: 'Distance (km)'},
  {id: 4, label: 'Moving Time (mins)'},
  {id: 5, label: 'Type'},
]

const earnersTableHeaders = [
  {id: 1, label: 'Name'},
  {id: 2, label: 'Earnings'},
]

function App() {
  const [data, setData] = useState([])
  const [earningsData, setEarningsData] = useState([])

  // Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [activityName, setActivityName] = useState('')
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('')
  const [sportType, setSportType] = useState('')

  // State for Form Apperance
  const [formActive, setFormActive] = useState(false)

  // SUCCESS STATE
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // WARNING STATE
  const [warning, setWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // ERROR STATE
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Handles the error / success messages popup
  function popupValidation(type, message) {
    if (type === 'success') {
      setLoading(false)
      setSuccess(true)
      setSuccessMessage(message)

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else if (type === 'warning') {
      setLoading(false)
      setWarning(true)
      setWarningMessage(message)

      setTimeout(() => {
        setError(false)
        setLoading(false)
        window.location.reload()
      }, 2500)
    } else if (type === 'error') {
      setLoading(false)
      setError(true)
      setErrorMessage(message)

      setTimeout(() => {
        setError(false)
        setLoading(false)
        window.location.reload()
      }, 2500)
    }
  }

  const getActivityData = async () => {
    const {data, error} = await supabase
      .from('PPStravaActivities')
      .select('*')
      .order('id', {ascending: false})
      .limit(10)

    if (error) {
      return error
    }

    if (data) {
      setData(data)
      return
    }
  }

  const getEarningsData = async () => {
    const {data, error} = await supabase.rpc('topearners').limit(5)

    if (error) {
      return error
    }

    if (data) {
      setEarningsData(data)
      return
    }
  }

  const sendActivityData = async () => {
    try {
      const {data, error} = await supabase.from('PPStravaActivities').insert([
        {
          firstName: firstName,
          lastName: lastName,
          activityName: activityName,
          distance: distance * 1000, // convert to metres
          movingTime: movingTime * 60, // convert to seconds
          sportType: sportType,
          earnings: 1,
          date: new Date().toISOString().split('T')[0],
        },
      ])

      if (data) {
        popupValidation('success', 'Successfully added new audience constraint')
      }
    } catch (error) {
      popupValidation('error', 'Something went wrong')
      console.log('error', error)
    }
  }

  useEffect(() => {
    getActivityData()

    getEarningsData()
  }, [])

  return (
    <>
      <div id="form" className="mt-8 mb-4">
        {success ? (
          <div
            className="fixed top-5 right-5 z-40 rounded-b-lg border-t-4 border-green-500 bg-green-100 px-4 py-3 text-green-900 shadow-md"
            role="alert"
          >
            <div className="flex">
              <div className="mr-3 py-1">
                <LightningBoltIcon size="28" className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold">Success</p>
                <p className="text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        ) : null}

        {warning ? (
          <div
            className="fixed top-5 right-5 z-40 rounded-b-lg border-t-4 border-yellow-500 bg-yellow-100 px-4 py-3 text-yellow-900 shadow-md"
            role="alert"
          >
            <div className="flex">
              <div className="mr-3 py-1">
                <ExclamationCircleIcon size="28" className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold">Warning</p>
                <p className="text-sm">{warningMessage}</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            className="fixed top-5 right-5 z-40 rounded-b-lg border-t-4 border-red-500 bg-red-100 px-4 py-3 text-red-900 shadow-md"
            role="alert"
          >
            <div className="flex">
              <div className="mr-3 py-1">
                <XCircleIcon size="28" className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="container mx-auto font-montserrat realtive z-10 mb-20">
        <>
          <section className="my-4 flex items-baseline">
            <img src={PPLogo} className="w-[300px]" />
            <span className="text-strava font-black uppercase text-3xl ml-2">
              fitness
            </span>
          </section>
        </>

        <>
          <section className="mt-8">
            <div>
              <p>
                If you have come to this page and have Strava please enter our
                Strava club{' '}
                <a
                  href="https://www.strava.com/clubs/teampulsepoint"
                  className="underline decoration-strava decoration-solid decoration-2 hover:text-strava"
                >
                  here
                </a>
                . Your activity will be automatically added to the leaderboard .
                If you don't have Strava or don't want to ever sign up to Strava
                please click the button to enter your activity.
              </p>
            </div>
            <div>
              <button
                className="bg-strava py-2 px-6 rounded-md text-white font-medium my-2"
                onClick={() => {
                  formActive ? setFormActive(false) : setFormActive(true)
                }}
              >
                Enter activity
              </button>
            </div>
          </section>

          <section
            className={`mb-8 ${
              !formActive ? 'hidden' : 'inline'
            } flex items-center justify-center`}
          >
            <form className="flex flex-col w-[65%] mb-8">
              <section
                id="form-top"
                className="inline-flex items-baseline justify-around"
              >
                <div id="first-name">
                  <div className="mt-[1.65rem]">
                    <label className="mb-2 block text-sm font-medium  text-gray-900">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      placeholder="Jonny"
                      onChange={e => setFirstName(e.target.value)}
                      className="relative w-full cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm "
                    />
                  </div>
                </div>
                <div id="last-name">
                  <div className="mt-[1.65rem]">
                    <label className="mb-2 block text-sm font-medium  text-gray-900">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      placeholder="Appleseed"
                      onChange={e => setLastName(e.target.value)}
                      className="relative w-full cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm "
                    />
                  </div>
                </div>
                <div id="activity-name">
                  <div className="mt-[1.65rem]">
                    <label className="mb-2 block text-sm font-medium  text-gray-900">
                      Activity Name
                    </label>
                    <input
                      type="text"
                      value={activityName}
                      placeholder="Epic Run...woohoo"
                      onChange={e => setActivityName(e.target.value)}
                      className="relative w-full cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm "
                    />
                  </div>
                </div>
              </section>

              <section
                id="form-bottom"
                className="inline-flex items-baseline justify-around"
              >
                <div id="distance">
                  <div className="mt-[1.65rem]">
                    <label className="mb-2 block text-sm font-medium  text-gray-900">
                      Distance
                    </label>
                    <input
                      type="text"
                      value={distance}
                      placeholder="00 km"
                      onChange={e => setDistance(e.target.value)}
                      className="relative w-full cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm "
                    />
                  </div>
                </div>

                <div id="moving-Time">
                  <div className="mt-[1.65rem]">
                    <label className="mb-2 block text-sm font-medium  text-gray-900">
                      Moving time
                    </label>
                    <input
                      type="text"
                      value={movingTime}
                      onChange={e => setMovingTime(e.target.value)}
                      placeholder="00 mins"
                      className="relative w-full cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm "
                    />
                  </div>
                </div>
                <div>
                  <Listbox value={sportType} onChange={setSportType}>
                    <Listbox.Label className="flex text-sm font-medium">
                      Activity Type
                    </Listbox.Label>
                    <Listbox.Button className="relative mt-2 w-60 cursor-default rounded-lg border border-zinc-500 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm ">
                      {sportType === '' ? (
                        'Select a sport type'
                      ) : (
                        <span className="font-normal">{sportType}</span>
                      )}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <SelectorIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-40 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {sportTypes.map(st => (
                          <Listbox.Option
                            key={st.id}
                            value={st.name}
                            className={({active}) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'text-gray-900'
                              }`
                            }
                            as={Fragment}
                          >
                            {({active}) => (
                              <li
                                className={`block truncate ${
                                  active
                                    ? 'bg-purple-100'
                                    : 'bg-white text-black'
                                }`}
                              >
                                <span className="ml-1">{st.name}</span>
                              </li>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </Listbox>
                </div>
              </section>
            </form>
            <div>
              <button
                className="bg-strava py-2 px-6 rounded-md text-white font-medium my-2"
                onClick={() => {
                  sendActivityData()
                  setFormActive(false)
                }}
              >
                Enter activity
              </button>
            </div>
          </section>
        </>
        <>
          <section className="relative z-0 mt-6">
            <div className="flex items-center justify-between w-[75%]">
              <div className="font-extrabold text-4xl">Combined Totals </div>
              <div className="font-extrabold text-5xl text-strava font-montserrat">
                {Math.round(
                  data.reduce((n, {distance}) => n + distance, 0) / 1000,
                ).toFixed(0)}{' '}
                km
              </div>
              <div>
                <span className="font-extrabold text-3xl">/</span>
              </div>
              <div className="font-extrabold text-5xl text-strava font-montserrat">
                {Math.round(
                  data.reduce((n, {movingTime}) => n + movingTime, 0) / 3600,
                ).toFixed(0)}{' '}
                hrs
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-extrabold text-4xl">
              Number of activites by type
            </h2>
            <div className="w-4/5 mx-auto">
              <div className="flex flex-row justify-between">
                <div id="walk" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🚶‍♂️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {data.filter(item => item.sportType === 'Walk').length}
                  </div>
                </div>
                <div id="swim" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🏊
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {data.filter(item => item.sportType === 'Swim').length}
                  </div>
                </div>
                <div id="bike" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🚴‍♀️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {data.filter(item => item.sportType === 'Ride').length}
                  </div>
                </div>
                <div id="run" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🏃‍♀️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {data.filter(item => item.sportType === 'Run').length}
                  </div>
                </div>

                <div id="weights" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      💪
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      data.filter(
                        item =>
                          item.sportType === 'Workout' ||
                          item.sportType === 'WeightTraining',
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-extrabold text-2xl">Top 5 Earners</h2>
            <div className="mt-6 flex">
              <div className="flex-grow">
                <table className="table-auto min-w-[50%] border border-strava-300">
                  <thead className="bg-strava">
                    <tr>
                      {earnersTableHeaders.map(headers => (
                        <th
                          key={headers.id}
                          className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-white font-montserrat text-center"
                        >
                          {headers.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData.map(data => (
                      <tr
                        key={data.firstName + data.lastName}
                        className="even:bg-purple-100"
                      >
                        <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                          {data.firstName + ' ' + data.lastName}
                        </td>
                        <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                          ${data.earnings}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center text-2xl">
                <div>total earnt</div>
                <div className="ml-10">
                  $
                  {Math.round(
                    data.reduce((n, {earnings}) => n + earnings, 0),
                  ).toFixed(0)}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-extrabold text-2xl">Latest 10 Activites</h2>
            <table className="table-auto min-w-full border border-strava-300">
              <thead className="bg-strava">
                <tr>
                  {mainTableHeaders.map(headers => (
                    <th
                      key={headers.id}
                      className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-white font-montserrat text-center"
                    >
                      {headers.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(data => (
                  <tr key={data.id} className="even:bg-purple-100">
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {data.firstName + ' ' + data.lastName}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {data.activityName}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {Math.round(data.distance / 1000) + ' km'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {Math.round(data.movingTime / 60) + ' mins'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {data.sportType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      </div>
    </>
  )
}

export default App

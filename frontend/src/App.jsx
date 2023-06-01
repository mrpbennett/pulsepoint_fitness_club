import {Listbox, Transition} from '@headlessui/react'
import {
  ExclamationCircleIcon,
  LightningBoltIcon,
  SelectorIcon,
  XCircleIcon,
} from '@heroicons/react/solid'
import {Fragment, useEffect, useState} from 'react'
import PPLogo from './assets/pp-logo.png'
import sportTypes from './data/sportTypes'
import {pageView} from './modules/ga'
import supabase from './modules/supabase'

const mainTableHeaders = [
  {id: 1, label: 'Name'},
  {id: 2, label: 'Activity'},
  {id: 3, label: 'Distance (km)'},
  {id: 4, label: 'Workout Time (mins)'},
  {id: 5, label: 'Type'},
]

const prestonTableHeaders = [
  {id: 1, label: 'Name'},
  {id: 2, label: 'Earnings'},
  {id: 3, label: 'Workouts'},
]

function App() {
  const [activityData, setActivityData] = useState([])
  const [topTenData, setTopTenData] = useState([])
  const [prestonWorkouts, setPrestonWorkouts] = useState([])

  console.log(prestonWorkouts)

  // Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [activityName, setActivityName] = useState('Gains 4 Gains')
  const [distance, setDistance] = useState('')
  const [movingTime, setMovingTime] = useState('30')
  const [sportType, setSportType] = useState('Prestons Fitness')

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
      setSuccess(true)
      setSuccessMessage(message)

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else if (type === 'warning') {
      setWarning(true)
      setWarningMessage(message)

      setTimeout(() => {
        setWarning(false)
      }, 2500)
    } else if (type === 'error') {
      setError(true)
      setErrorMessage(message)

      setTimeout(() => {
        setError(false)
        window.location.reload()
      }, 2500)
    }
  }

  const getActivityData = async () => {
    const {data, error} = await supabase
      .from('PPFitnessActivities')
      .select('*')
      .order('id', {ascending: false})

    if (error) {
      return error
    }

    if (data) {
      setActivityData(data)
      return
    }
  }

  const getTop10ActivityData = async () => {
    const {data, error} = await supabase
      .from('PPFitnessActivities')
      .select('*')
      .order('id', {ascending: false})
      .limit(10)

    if (error) {
      return error
    }

    if (data) {
      setTopTenData(data)
      return
    }
  }

  const getPrestonWorkouts = async () => {
    const {data, error} = await supabase
      .rpc('prestonfitness')
      .order('earnings', {ascending: false})
      .limit(5)

    if (error) {
      return error
    }

    if (data) {
      setPrestonWorkouts(data)
      return
    }
  }

  const handleSubmit = async () => {
    if (firstName === '') {
      popupValidation('warning', 'Please enter your first name')
    } else if (lastName === '') {
      popupValidation('warning', 'Please enter your last name')
    } else if (activityName === '') {
      popupValidation('warning', 'Please enter a Work Type (e.g. Run)')
    } else if (movingTime === '') {
      popupValidation('warning', 'Please enter a workout time in minutes')
    } else if (sportType === '') {
      popupValidation('warning', 'Please set a Acvitity type')
    } else {
      try {
        const {data, error} = await supabase
          .from('PPFitnessActivities')
          .insert([
            {
              first_name: firstName,
              last_name: lastName,
              activity_name: activityName,
              distance: distance === '' ? 0 : distance * 1000, // convert to metres
              moving_time: movingTime * 60, // convert to seconds
              sport_type: sportType,
              earnings: 3,
              date: new Date().toISOString().split('T')[0],
            },
          ])

        popupValidation('success', 'Successfully added workout')

        // Reset form
        setFirstName('')
        setLastName('')
        setActivityName('')
        setDistance('')
        setMovingTime('')
        setSportType('')

        // Close form
        setFormActive(false)

        // Redirect to Preston's Fitness page after a 'Preston' workout is added
        if (sportType === 'Prestons Fitness') {
          window.location.href = 'https://prestonconnors.com/livestream'
        }

        if (error) {
          popupValidation('error', error.message)
        }
      } catch (error) {
        popupValidation('error', 'Something went wrong')
        console.log('error', error)
      }
    }
  }

  useEffect(() => {
    pageView(window.location.pathname)

    getActivityData()

    getTop10ActivityData()

    getPrestonWorkouts()
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
                Enter your activity
              </button>
            </div>
          </section>

          <section
            className={`mb-8 ${
              formActive ? 'inline' : 'hidden'
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
                      Distance (km)
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
                      Workout time (mins)
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
                        'Prestons Fitness'
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
                type="submit"
                className="bg-strava py-2 px-6 rounded-md text-white font-medium my-2"
                onClick={() => {
                  console.log('submitting')
                  handleSubmit()
                }}
              >
                Add Workout
              </button>
            </div>
          </section>
        </>
        <>
          <section className="relative z-0 mt-6">
            <div className="flex items-center justify-between w-[75%]">
              <div className="font-extrabold text-4xl text-gray-800">
                Combined Totals{' '}
              </div>
              <div className="font-extrabold text-5xl text-strava font-montserrat">
                {Math.round(
                  activityData.reduce((n, {distance}) => n + distance, 0) /
                    1000,
                ).toFixed(0)}{' '}
                km
              </div>
              <div>
                <span className="font-extrabold text-3xl">/</span>
              </div>
              <div className="font-extrabold text-5xl text-strava font-montserrat">
                {Math.round(
                  activityData.reduce(
                    (n, {moving_time}) => n + moving_time,
                    0,
                  ) / 3600,
                ).toFixed(0)}{' '}
                hrs
              </div>
            </div>
          </section>

          <section className="my-4">
            <h2 className="font-extrabold text-3xl text-gray-800">
              Number of activites by type
            </h2>
            <div className="w-4/5 mx-auto mt-8">
              <div className="flex flex-row justify-between">
                <div id="walk" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🚶‍♂️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      activityData.filter(
                        item =>
                          item.sport_type === 'Walk' ||
                          item.sport_type === 'Hike',
                      ).length
                    }
                  </div>
                </div>
                <div id="swim" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🏊
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      activityData.filter(item => item.sport_type === 'Swim')
                        .length
                    }
                  </div>
                </div>
                <div id="bike" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🚴‍♀️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      activityData.filter(
                        item =>
                          item.sport_type === 'Ride' ||
                          item.sport_type === 'Gravel Ride' ||
                          item.sport_type === 'Virtual Ride' ||
                          item.sport_type === 'Mountain Bike Ride' ||
                          item.sport_type === 'EBike Ride',
                      ).length
                    }
                  </div>
                </div>
                <div id="run" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🏃‍♀️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      activityData.filter(
                        item =>
                          item.sport_type === 'Run' ||
                          item.sport_type === 'Virtual Run' ||
                          item.sport_type === 'Trail Run',
                      ).length
                    }
                  </div>
                </div>

                <div id="weights" className="flex items-center">
                  <div>
                    <span role="img" className="text-6xl mr-2">
                      🏋️
                    </span>
                  </div>
                  <div className="text-6xl font-bold">
                    {
                      activityData.filter(
                        item =>
                          item.sport_type === 'Workout' ||
                          item.sport_type === 'Weight Training' ||
                          item.sport_type === 'Crossfit' ||
                          item.sport_type ===
                            'High Intensity Interval Training' ||
                          item.sport_type === 'Prestons Fitness',
                      ).length
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-extrabold text-2xl">
              Top 5 Prestons Fitness athletes
            </h2>
            <div className="mt-6 grid grid-cols-2">
              <div>
                <table className="table-auto w-full border border-strava-300">
                  <thead className="bg-strava">
                    <tr>
                      {prestonTableHeaders.map(headers => (
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
                    {prestonWorkouts.map(data => (
                      <tr
                        key={data.firstName + data.lastName}
                        className="even:bg-purple-100 "
                      >
                        <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat capitalize">
                          {data.firstName + ' ' + data.lastName}
                        </td>
                        <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                          ${data.earnings}
                        </td>
                        <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                          {data.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <h2 className="font-extrabold my-4 text-2xl">Latest 10 Activites</h2>
          <section className="mt-6">
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
                {topTenData.map(data => (
                  <tr key={data.id} className="even:bg-purple-100">
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat capitalize">
                      {data.first_name + ' ' + data.last_name}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {data.activity_name}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {Math.round(data.distance / 1000) + ' km'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {Math.round(data.moving_time / 60) + ' mins'}
                    </td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm font-medium  text-gray-700 font-montserrat">
                      {data.sport_type}
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

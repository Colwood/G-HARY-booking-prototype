import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Booking = {
  id: string
  user_id: string
  start_time: string
  end_time: string
  notes: string | null
}

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch bookings from Supabase
  async function fetchBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) {
      alert('Error loading bookings: ' + error.message)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Add new booking
  async function addBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!startTime || !endTime) {
      alert('Please enter start and end times')
      return
    }

    const { error } = await supabase.from('bookings').insert([
      {
        start_time: startTime,
        end_time: endTime,
        notes,
        // user_id: your user id here if you have authentication
      },
    ])

    if (error) {
      alert('Error adding booking: ' + error.message)
    } else {
      setStartTime('')
      setEndTime('')
      setNotes('')
      fetchBookings()
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Light Aircraft Booking</h1>

      <h2>Add a Booking</h2>
      <form onSubmit={addBooking}>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Notes:
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Add Booking</button>
      </form>

      <h2>Existing Bookings</h2>
      {loading ? (
        <p>Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        <ul>
          {bookings.map(b => (
            <li key={b.id}>
              <strong>
                {new Date(b.start_time).toLocaleString()} –{' '}
                {new Date(b.end_time).toLocaleString()}
              </strong>
              <br />
              {b.notes}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

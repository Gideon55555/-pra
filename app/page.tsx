import ExploreBtn from "./components/ExploreBtn"
import { events } from "./lib/constants"
import EventCard from "@/components/EventCard"

const page = () => {
  return (
   <section>
    <h1 className="text-center mt-25">The Hub For Ever Dev <br /> Event You Can&apos;t Miss </h1>
    <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in One Place </p>
    <ExploreBtn /> 


    <div className="mt-20 space-y-7">

      <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event.slug} >
       <EventCard {...event}/>
            </li>
          ))}
        </ul>

      

    </div>
   </section>
  )
}

export default page

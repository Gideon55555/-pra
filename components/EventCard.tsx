'use client';

import Image from "next/image";
import Link from "next/link";
import posthog from 'posthog-js';

interface props{
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    slug: string;
}

const EventCard = ({title, date, slug, time, location, image}:props) => {
  const handleClick = () => {
    posthog.capture('event_card_clicked', {
      event_slug: slug,
      event_title: title,
      event_date: date,
      event_time: time,
      event_location: location,
    });
  };

  return (
    <Link href={`/events/${slug}`} id="event-card" onClick={handleClick}>
    <Image src={image} alt={title} width={410} height={300} className="poster"/>



            <div className="felx flex-row gap-2">
                <Image 
                    src="/icons/pin.svg" 
                    alt="location"
                    width={14}
                    height={14}/>
                <p>{location}</p>
            </div>
    <p className="event-title">{title}</p>

    <div className="datetime">
        <div className="">
            <Image 
                src="/icons/calendar.svg" 
                alt="calendar"
                width={14}
                height={14}/>
            <p>{date}</p>
        </div>
        <div className="">
            <Image 
                src="/icons/clock.svg" 
                alt="time"
                width={14}
                height={14}/>
            <p>{date}</p>
        </div>
    </div>
    </Link>
  )
}

export default EventCard

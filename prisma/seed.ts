import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.shootDeliverable.deleteMany();
  await prisma.shoot.deleteMany();
  await prisma.vessel.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.client.deleteMany();

  // Clients
  const [harbor, nautique, coastline] = await prisma.$transaction([
    prisma.client.create({
      data: {
        companyName: "Harbor View Brokers",
        contactName: "James Whitfield",
        email: "james@harborviewbrokers.com.au",
        phone: "+61 7 5555 0100",
        clientType: "BROKER",
        stage: "ACTIVE",
        location: "Gold Coast Marina",
        monthlyValue: 4800,
        notes: "Top broker on the Gold Coast — 3 active listings this quarter",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Nautique Charter Co.",
        contactName: "Priya Anand",
        email: "priya@nautiquecharter.com.au",
        phone: "+61 7 5555 0200",
        clientType: "CHARTER_OP",
        stage: "REPEAT",
        location: "Mooloolaba Marina",
        monthlyValue: 3200,
        notes: "Monthly social media retainer. Shoots every 6 weeks.",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Coastline Private",
        contactName: "Marcus Bell",
        email: "marcus@coastlineprivate.com.au",
        phone: "+61 412 555 033",
        clientType: "VESSEL_OWNER",
        stage: "ACTIVE",
        location: "Brisbane River",
        monthlyValue: 2200,
        notes: "Private owner, 62ft Sunseeker. Preparing vessel for sale.",
      },
    }),
  ]);

  // Vessels
  const [prestige, aurora, sovereign] = await prisma.$transaction([
    prisma.vessel.create({
      data: {
        name: "Prestige 750",
        vesselType: "MOTOR_YACHT",
        lengthM: 22.9,
        listingPrice: 2850000,
        marina: "Gold Coast Marina",
        listingStatus: "FOR_SALE",
        clientId: harbor.id,
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Aurora",
        vesselType: "CATAMARAN",
        lengthM: 18.5,
        marina: "Mooloolaba Marina",
        listingStatus: "CHARTER",
        clientId: nautique.id,
      },
    }),
    prisma.vessel.create({
      data: {
        name: "Sovereign III",
        vesselType: "SUPERYACHT",
        lengthM: 18.9,
        listingPrice: 1750000,
        marina: "Portside Brisbane",
        listingStatus: "FOR_SALE",
        clientId: coastline.id,
      },
    }),
  ]);

  // Shoots
  const [shootPrestige, shootAurora, shootSovereign] = await prisma.$transaction([
    prisma.shoot.create({
      data: {
        vesselId: prestige.id,
        shootDate: addDays(new Date(), 4),
        location: "Gold Coast Seaway",
        weatherNotes: "6kt ESE forecast — ideal conditions",
        services: "PHOTO,VIDEO,VIRTUAL_TOUR",
        status: "BOOKED",
        budget: 3800,
        notes: "Full listing package. 4hr shoot window from 7am.",
      },
    }),
    prisma.shoot.create({
      data: {
        vesselId: aurora.id,
        shootDate: addDays(new Date(), 12),
        location: "Mooloolaba Spit",
        weatherNotes: "Check BOM 48hr out",
        services: "PHOTO,REEL",
        status: "BOOKED",
        budget: 1900,
        notes: "Monthly content update. Focus on guest experience lifestyle.",
      },
    }),
    prisma.shoot.create({
      data: {
        vesselId: sovereign.id,
        shootDate: addDays(new Date(), -5),
        location: "Moreton Bay",
        services: "PHOTO,VIDEO",
        status: "COMPLETED",
        budget: 2600,
        notes: "Shoot completed. Editing in progress.",
      },
    }),
  ]);

  // Deliverables
  await prisma.$transaction([
    prisma.shootDeliverable.create({
      data: {
        shootId: shootPrestige.id,
        type: "PHOTO",
        title: "40 edited listing photos",
        completed: false,
        dueDate: addDays(new Date(), 7),
      },
    }),
    prisma.shootDeliverable.create({
      data: {
        shootId: shootPrestige.id,
        type: "VIDEO",
        title: "3-minute cinematic listing video",
        completed: false,
        dueDate: addDays(new Date(), 9),
      },
    }),
    prisma.shootDeliverable.create({
      data: {
        shootId: shootPrestige.id,
        type: "VIRTUAL_TOUR",
        title: "360° virtual walkthrough",
        completed: false,
        dueDate: addDays(new Date(), 10),
      },
    }),
    prisma.shootDeliverable.create({
      data: {
        shootId: shootSovereign.id,
        type: "PHOTO",
        title: "30 edited listing photos",
        completed: true,
        dueDate: addDays(new Date(), -1),
        link: "https://dropbox.com/share/sovereign-photos",
      },
    }),
    prisma.shootDeliverable.create({
      data: {
        shootId: shootSovereign.id,
        type: "VIDEO",
        title: "2-minute showcase video",
        completed: false,
        dueDate: addDays(new Date(), 2),
      },
    }),
  ]);

  // Leads
  await prisma.$transaction([
    prisma.lead.create({
      data: {
        name: "Tom Halcrow",
        email: "tom@halcrowmarine.com.au",
        phone: "+61 417 555 001",
        vesselName: "Pacific Star",
        vesselType: "MOTOR_YACHT",
        location: "Sanctuary Cove",
        servicesInterested: "PHOTO,VIDEO",
        budget: "$3,000–5,000",
        timeline: "Mid April",
        stage: "NEW",
        source: "website",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Sophie Crane",
        email: "sophie@bluewatersales.com.au",
        vesselName: "Serenity",
        vesselType: "SAILING",
        location: "Southport",
        servicesInterested: "PHOTO",
        budget: "$1,500",
        timeline: "ASAP",
        stage: "QUOTED",
        source: "referral",
        notes: "Referred by James Whitfield. Single-day photo package.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Ryan Oakes",
        email: "r.oakes@gmail.com",
        phone: "+61 414 555 009",
        vesselName: "Blue Horizon",
        vesselType: "CATAMARAN",
        location: "Manly Harbour",
        servicesInterested: "REEL",
        budget: "$800",
        timeline: "May",
        stage: "CONTACTED",
        source: "instagram",
        notes: "Wants short social media reel for Instagram. Budget is tight.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Delta Marine Brokers",
        email: "listings@deltamarine.com.au",
        vesselName: "Multiple",
        location: "Whitsundays",
        servicesInterested: "PHOTO,VIDEO,VIRTUAL_TOUR",
        budget: "$15,000+",
        timeline: "Ongoing",
        stage: "BOOKED",
        source: "direct",
        notes: "Agency deal — 5 vessels per quarter. Contract in review.",
      },
    }),
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  await prisma.$transaction([
    prisma.expense.create({ data: { title: "Adobe Creative Cloud", amount: 89, purpose: "Premiere + Lightroom", month: currentMonth } }),
    prisma.expense.create({ data: { title: "Matterport Pro", amount: 69, purpose: "360° virtual tour platform", month: currentMonth } }),
    prisma.expense.create({ data: { title: "Fuel (boat)", amount: 220, purpose: "On-water shoots — Gold Coast", month: currentMonth } }),
    prisma.expense.create({ data: { title: "Lens hire", amount: 150, purpose: "Canon 16-35mm f/2.8 rental", month: currentMonth } }),
    prisma.expense.create({ data: { title: "Frame.io", amount: 45, purpose: "Client review + delivery", month: currentMonth } }),
  ]);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

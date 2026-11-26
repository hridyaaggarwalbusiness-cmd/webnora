export const plans = [
  [
    "Launch",
    "Website",
    "4,999",
    "Your business deserves a professional online presence.",
    "Custom brand styling|Up to five standard pages|Responsive layout|Contact and inquiry form|WhatsApp, maps and social links|Image gallery|Basic SEO and performance optimization|HTTPS deployment assistance",
    "Build My Website",
  ],
  [
    "Elevate",
    "Application",
    "9,999",
    "Put your business in your customers’ hands.",
    "Custom interface and UX|Authentication and profiles|Database integration|Core application functionality|Responsive application design|Basic administrative controls|Real-time data where required|Expandable architecture and deployment assistance",
    "Build My App",
  ],
  [
    "Enterprise",
    "Business software",
    "14,999",
    "One intelligent system. Your entire business.",
    "Management dashboard|Admin and employee roles|Customer and database management|Reports and analytics|Search and configurable modules|Data export and activity tracking|Deployment assistance|Initial administrator training",
    "Digitize My Business",
  ],
];
export const services = [
  [
    "websites",
    "Website development",
    "A distinctive home for your business online.",
    "Business and corporate websites|Hotel and restaurant websites|School and portfolio websites|Product catalogues|E-commerce|Booking and inquiry systems|Animated landing pages",
  ],
  [
    "applications",
    "Application development",
    "Give customers and teams the tools they need, wherever they work.",
    "Student and parent apps|Customer and employee apps|Booking systems|Progressive web apps|Cross-platform interfaces|Real-time dashboards",
  ],
  [
    "software",
    "Custom business software",
    "Bring people, records and daily decisions into one workspace.",
    "Billing and invoicing|Inventory and attendance|Customer management|Booking management|Roles and reports|Business automation",
  ],
];
export const projects = [
  [
    "madaan",
    "Madaan International School",
    "Education technology",
    "Software,Apps,AI",
    "Bring families, teachers and administrators into a shared school workspace.",
    "Attendance|Homework|Timetables and fees|Bus tracking|AI-assisted assessments",
    "Campus workspace",
  ],
  [
    "narang",
    "Narang Hotel",
    "Hospitality",
    "Websites",
    "Help guests discover rooms, explore facilities and enquire about a stay.",
    "Room galleries|Reservation inquiries|Content management",
    "Reservations",
  ],
  [
    "aggarwal",
    "Aggarwal Caterers",
    "Food & catering",
    "Websites",
    "Connect menu discovery with event planning in a single experience.",
    "Menu collections|Event inquiry|Animated thali introduction",
    "Seasonal menu",
  ],
  [
    "salon",
    "Salon & Parlour",
    "Beauty & lifestyle",
    "Websites",
    "Make treatments easier to compare and appointments easier to request.",
    "Service catalogue|Appointment inquiries|Transformation effects",
    "Studio appointments",
  ],
  [
    "stream",
    "Ticketed Streaming",
    "Entertainment technology",
    "Apps",
    "Connect ticket validation with a continuous viewing session.",
    "Ticket validation|Sequential playback|Video prefetch|Firebase integration",
    "Screening room",
  ],
  [
    "video",
    "Browser Video Studio",
    "Multimedia tools",
    "Software",
    "Preview footage and prepare synchronized clips directly in the browser.",
    "Timeline preview|Clip splitting|Audio synchronization|Export",
    "Editing suite",
  ],
  [
    "world",
    "Open World",
    "Experimental game",
    "3D Experiences",
    "Explore a connected city through a browser-based interactive world.",
    "Third-person movement|Vehicles and railways|Three.js lighting",
    "World explorer",
  ],
];
export const industries = [
  "Hotel",
  "Restaurant",
  "Catering",
  "Education",
  "Retail",
  "Rice mill or manufacturing",
  "Salon",
  "Healthcare",
  "Professional services",
  "Local business",
  "Startup",
  "E-commerce",
  "Other",
];
export const stages = [
  "Discover",
  "Design",
  "Develop",
  "Test",
  "Launch",
  "Support",
];
export const stageCopy = [
  "Understand your business and agree on the scope.",
  "Explore the visual direction and map the experience.",
  "Turn approved designs into working software.",
  "Check usability, security, performance and responsive layouts.",
  "Prepare your domain, deployment and handover.",
  "Plan improvements and maintenance around your needs.",
];
export const addOns = {
  "Online booking": 2000,
  "Product catalogue": 1500,
  "Payment integration": 3000,
  "Admin dashboard": 2500,
  "User accounts": 1500,
  "Inventory management": 3000,
  "Reports and analytics": 2000,
  "WhatsApp integration": 0,
  "AI features": 4000,
  "Real-time tracking": 3500,
  "Custom animations": 2000,
  "Multilingual support": 2000,
};
export const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

CREATE TABLE admins (
    admin_id TEXT DEFAULT substr(md5(random()::text), 1, 10) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(6) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(150) UNIQUE NOT NULL,
    residency VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE admin_settings (
    admin_id TEXT REFERENCES admins(admin_id),
    theme VARCHAR(20) DEFAULT 'light',
    font_size VARCHAR(20) DEFAULT 'medium',
    language VARCHAR(20) DEFAULT 'english',
    PRIMARY KEY (admin_id)
);

CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    photos JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
    events_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'upcoming',
    photos JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- News table for storing news articles
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(255),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    photo JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vacancies table for job postings
CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(255),
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    responsibilities TEXT,
    qualifications TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


SELECT * FROM admins

DROP TABLE vacancies

SELECT 
    *,
    TO_CHAR(start_date, 'Dy, Mon DD YYYY') AS start_date_short,
    TO_CHAR(end_date, 'DY, Mon DD YYYY') AS end_date_short
FROM events;




TRUNCATE TABLE complaints RESTART IDENTITY

SELECT * FROM vacancies

DELETE FROM complaints WHERE  complaint_id > 14


SELECT 
    COUNT(*) AS total_complaints,
    COUNT(*) FILTER ( WHERE status = 'assigning' ) AS assigned_complaints,
    COUNT(*) FILTER ( WHERE status = 'in progress' ) AS progress_complaints,
    COUNT(*) FILTER ( WHERE status = 'resolved' ) AS resolved_complaints
FROM complaints





INSERT INTO complaints (first_name, last_name, email, phone, type, status, description, photos) 
VALUES  ('Mulugeta', 'Kebede', 'mulukebede@gmail.com', '0912345678', 'sanitation', 'assigning', 'I would like to report an issue regarding the sanitation conditions in our office area. For the past week, the trash bins have not been emptied regularly, causing an unpleasant smell and attracting insects. The restroom near the main hall is also not being cleaned properly.','[{"name": "photo1.png", "url": "/uploads/photo1.png" },{"name": "photo2.png", "url": "/uploads/photo2.png" }]'::JSONB),
        ('Rahel','Tesfaye','raheltesfaye@gmail.com','0912345679','water supply','in progress','Water supply has been inconsistent for the past month, causing significant inconvenience to residents. We request urgent attention to fix the leaks and improve water distribution.','[]'::jsonb),
        ('Abel','Haile','abelhaile@gmail.com','0912345680','road condition','resolved','There are several cracks and potholes on the main road leading to our neighborhood, making it difficult and unsafe for vehicles and pedestrians. Immediate repair is needed.','[]'::jsonb),
        ('Lidiya','Tsegaye','lidyatsegaye@gmail.com','0912345681','construction','assigning','Unauthorized construction is taking place on public land, blocking access and creating safety hazards. We urge authorities to investigate and take necessary actions.','[]'::jsonb),
        ('Solomon','Fikre','solomonfikre@gmail.com','0912345682','customer service','in progress','Customer service representatives have been unresponsive to complaints, leading to frustration among clients. We request improved communication and support.','[]'::jsonb),
        ('Hana','Berhanu','hanaberhanu@gmail.com','0912345683','finance','resolved','Finance department has delayed processing reimbursements for over two months, causing financial strain for employees. Prompt resolution is requested.','[]'::jsonb),
        ('Bereket','Yonas','bereketyonas@gmail.com','0912345684','public health','assigning','Public health concerns have arisen due to stagnant water in several areas, increasing the risk of mosquito-borne diseases. Immediate cleanup is necessary.','[]'::jsonb),
        ('Saron','Mekonnen','saronmekonnen@gmail.com','0912345685','sanitation','in progress','Sanitation workers have not been collecting garbage on schedule, leading to accumulation and unpleasant odors in the neighborhood. Please address this issue.','[]'::jsonb),
        ('Meron','Haileselassie','meronhaileselassie@gmail.com','0912345686','sanitation','resolved','Sanitation facilities in the public park are inadequate and poorly maintained, discouraging visitors and creating hygiene concerns. Improvements are needed.','[]'::jsonb),
        ('Dawit','Tesfaw','dawittesfaw@gmail.com','0912345687','customer service','assigning','Customer service delays have caused long wait times and unresolved issues for many clients. We request enhanced service efficiency.','[]'::jsonb),
        ('Feven','Tsegaye','feventsegaye@gmail.com','0912345688','maintenance','in progress','Maintenance requests for office equipment have been ignored, resulting in decreased productivity. Please prioritize these repairs.','[]'::jsonb),
        ('Nahom','Berhanu','nahomberhanu@gmail.com','0912345689','service delivery','resolved','There have been frequent delays in service delivery, causing inconvenience and dissatisfaction among customers. We seek timely improvements.','[]'::jsonb),
        ('Eden','Asfaw','edenasfaw@gmail.com','0912345690','sanitation','assigning','Trash bins in the residential area are overflowing and not emptied regularly, leading to health hazards and unpleasant surroundings. Immediate action required.','[]'::jsonb);

-- Sample News Data
INSERT INTO news (title, short_description, description, category, photo, created_at)
VALUES  ('New Community Center Opens in Lideta', 'New community center opens with various programs for all ages', 'The new community center in Lideta Sub-City has officially opened its doors, offering various programs and services for residents of all ages.', 'Community', '[{"name": "community-center.jpg", "url": "/uploads/community-center.jpg"}]'::jsonb, '2025-12-10 09:00:00'),
        ('Annual Health Fair a Success', 'Over 500 residents benefit from free health screenings', 'The annual health fair attracted over 500 residents who received free health screenings and medical consultations.', 'Health', '[{"name": "health-fair.jpg", "url": "/uploads/health-fair.jpg"}]'::jsonb, '2025-12-05 10:30:00'),
        ('Local School Wins National Science Competition', 'Local students win first place in national science competition', 'Students from Lideta High School won first place in the national science fair with their innovative renewable energy project.', 'Education', '[{"name": "science-fair.jpg", "url": "/uploads/science-fair.jpg"}]'::jsonb, '2025-12-01 14:15:00'),
        ('Road Construction Project Begins', 'Infrastructure improvements begin in western part of the city', 'The much-anticipated road construction project in the western part of the sub-city has begun, expected to improve traffic flow.', 'Infrastructure', '[{"name": "road-construction.jpg", "url": "/uploads/road-construction.jpg"}]'::jsonb, '2025-11-28 08:45:00'),
        ('New Waste Management Initiative Launched', 'New recycling program promotes environmental sustainability', 'A new recycling program has been launched to promote environmental sustainability in our community.', 'Environment', '[{"name": "recycling.jpg", "url": "/uploads/recycling.jpg"}]'::jsonb, '2025-11-25 11:20:00');
        ('Lideta Launches New Digital Service Center', 'New digital service center improves citizen access to municipal services', 'The Lideta Sub-City administration has launched a new digital service center designed to streamline services such as ID processing, tax inquiries, and community applications.',  'Technology', '[{"name": "digital-center.jpg", "url": "/uploads/digital-center.jpg"}]'::jsonb, '2025-11-22 09:00:00'),
        ('Sub-City Undertakes Major Road Maintenance', 'Road maintenance project begins across multiple neighborhoods', 'A large-scale road maintenance initiative has begun to repair potholes and improve safety across several districts in the sub-city.', 'Infrastructure',  '[{"name": "road-maintenance.jpg", "url": "/uploads/road-maintenance.jpg"}]'::jsonb,  '2025-11-18 07:30:00'),
        ('Local Library Expands Youth Programs',  'Youth programs expanded with new reading and computer classes',  'The Lideta public library has expanded its youth programs with new reading clubs, computer literacy classes, and weekend workshops.',  'Education',  '[{"name": "library-youth.jpg", "url": "/uploads/library-youth.jpg"}]'::jsonb,  '2025-11-14 13:10:00'),
        ('Community Garden Initiative Grows', 'Residents volunteer to expand the community garden spaces', 'The community garden project continues to grow as local residents volunteer to plant vegetables, herbs, and flowers in shared public spaces.', 'Environment', '[{"name": "community-garden.jpg", "url": "/uploads/community-garden.jpg"}]'::jsonb, '2025-11-10 10:40:00'),
        ('Lideta Hosts Annual Business Forum', 'Local business leaders gather to discuss growth strategies', 'The annual business forum brought together entrepreneurs and officials to discuss investment opportunities and strategies for local economic growth.', 'Business', '[{"name": "business-forum.jpg", "url": "/uploads/business-forum.jpg"}]'::jsonb, '2025-11-07 08:55:00'),
        ('Public Park Renovation Completed', 'Major renovation of central park completed', 'Renovation of the central public park has been completed, featuring new playgrounds, walking paths, and improved lighting.', 'Community', '[{"name": "park-renovation.jpg", "url": "/uploads/park-renovation.jpg"}]'::jsonb, '2025-11-03 15:20:00'),
        ('Sub-City Expands Waste Collection Fleet', 'New vehicles added to support waste collection services', 'The administration has added new waste collection trucks to improve sanitation services and reduce delays in garbage pickup.', 'Sanitation', '[{"name": "waste-trucks.jpg", "url": "/uploads/waste-trucks.jpg"}]'::jsonb, '2025-10-30 09:45:00'),
        ('Youth Sports League Kicks Off', 'New youth sports season begins with football and athletics competitions', 'The youth sports league has officially begun, encouraging participation in football, athletics, and other activities to promote healthy living.', 'Sports', '[{"name": "youth-sports.jpg", "url": "/uploads/youth-sports.jpg"}]'::jsonb, '2025-10-25 11:15:00'),
        ('New Public WiFi Zones Installed', 'Free WiFi zones activated at key public locations', 'Residents can now enjoy free public WiFi in areas including the central park, bus station, and community square.', 'Technology', '[{"name": "wifi-zone.jpg", "url": "/uploads/wifi-zone.jpg"}]'::jsonb, '2025-10-20 12:30:00'),
        ('Fire Safety Training for Residents', 'Residents receive fire safety and emergency response training', 'A joint initiative with the fire department provided hands-on fire safety training and emergency response education for residents.', 'Safety', '[{"name": "fire-training.jpg", "url": "/uploads/fire-training.jpg"}]'::jsonb, '2025-10-17 09:05:00');




-- Sample Vacancy Data
INSERT INTO vacancies (title, short_description, description, location, salary, type, category, responsibilities, qualifications, start_date, end_date)
VALUES  ('IT Systems Administrator','Maintain and secure the administration’s IT infrastructure','We are seeking a skilled IT Systems Administrator to oversee the sub-city’s servers, networks, and security systems.','Lideta Administration Office','Negotiable','Full-time','Technology','Manage servers, monitor system performance, ensure cybersecurity measures, provide technical support to departments.','Degree in Computer Science or IT, 3+ years experience, strong networking and security knowledge.','2025-12-20','2026-01-20'),
        ('Environmental Safety Inspector','Ensure public safety through environmental inspections','The Environmental Safety Inspector will monitor sanitation practices, assess pollution risks, and ensure compliance with environmental regulations.','Lideta Sub-City Environment Office','As per government scale','Full-time','Environment','Conduct field inspections, prepare environmental assessment reports, enforce safety standards.','Degree in Environmental Science, 2+ years inspection experience, knowledge of local regulations.','2025-12-18','2026-01-18'),
        ('Infrastructure Project Coordinator','Coordinate major infrastructure and road development projects','The Project Coordinator will support planning, monitoring, and execution of infrastructure projects within the sub-city.','Infrastructure Development Bureau','Competitive','Full-time','Infrastructure','Coordinate project timelines, prepare reports, collaborate with contractors and engineers.','Degree in Civil Engineering or related field, project management experience preferred.','2025-12-22','2026-01-22'),
        ('Community Health Outreach Officer','Lead health education and medical outreach activities','Seeking a dedicated officer to organize and manage community health programs in collaboration with clinics and health agencies.','Lideta Health Center','As per government scale','Part-time','Health','Organize health campaigns, assist with screenings, prepare awareness materials.','Diploma or degree in Public Health, strong communication skills.','2025-12-10','2026-01-10'),
        ('Education Program Facilitator','Support youth and adult learning programs','The Education Program Facilitator will help coordinate classes, workshops, and literacy programs at local community centers.','Lideta Community Center','Negotiable','Part-time','Education','Assist instructors, manage attendance, coordinate learning materials and events.','Degree or certificate in Education or related field, experience with community programs.','2025-12-25','2026-01-25'),
        ('Municipal Security Officer','Ensure safety and protection of municipal facilities','The Security Officer will monitor municipal property, assist in emergencies, and maintain safety protocols across all offices.','Lideta Administration Building','As per government scale','Full-time','Security','Monitor CCTV, patrol facilities, maintain incident reports, enforce security procedures.','High school diploma, prior security experience preferred.','2025-12-12','2026-01-12'),
        ('Public Event Coordinator','Organize and manage community events and programs','We are seeking an Event Coordinator to plan and manage public activities including festivals, awareness events, and workshops.','Events Department, Lideta Sub-City','Competitive','Full-time','Event','Plan events, coordinate logistics, manage budgets, work with vendors and the community.','Experience in event planning, strong organizational skills.','2025-12-28','2026-01-28'),
        ('Renewable Energy Technician','Assist in installing and maintaining renewable energy systems','The Renewable Energy Technician will support projects involving solar installations and energy conservation initiatives.','Lideta Sub-City Energy Office','Negotiable','Full-time','Technology','Install solar equipment, maintain systems, conduct site inspections.','Technical diploma in Renewable Energy or related field.','2025-12-16','2026-01-16'),
        ('School IT Support Assistant','Provide basic IT assistance for teachers and students','Assist with maintaining computer labs, supporting digital learning tools, and troubleshooting technical issues.','Lideta Public School','As per government scale','Part-time','Technology','Troubleshoot computers, set up projectors, update software.','Certificate in IT support, strong troubleshooting skills.','2025-12-19','2026-01-19'),
        ('Community Environmental Educator','Teach residents about environmental protection and sustainability','Help conduct workshops, awareness programs, and school visits focusing on recycling, conservation, and clean community living.','Environmental Conservation Unit','Negotiable','Full-time','Environment','Lead workshops, prepare educational materials, organize community cleanups.','Degree in Environmental Education or related field.','2025-12-14','2026-01-14');


-- Events data continues here
INSERT INTO events (title, description, location, start_date, end_date, status, photos)
VALUES  ('Neighborhood Tree Planting', 'Volunteers gather to plant trees in public parks to promote greenery.', 'Central Park, Lideta Sub-City', '2025-12-15', '2025-12-16', 'upcoming', '[]'::jsonb),
        ('Global Summit 2025', 'A cross-sector summit bringing together local leaders and global partners.', 'Sar Bet Area, Lideta Sub-City', '2025-12-31', '2026-01-31', 'pending', '[]'::jsonb),
        ('World Design Challenge', 'A completed design challenge highlighting urban planning and community spaces.', 'Sar Bet Area, Lideta Sub-City', '2025-12-03', '2025-12-12', 'complete', '[]'::jsonb),
        ('Innovation and Technology Day', 'A technology showcase featuring local startups and municipal services.', 'Sar Bet Area, Lideta Sub-City', '2025-12-11', '2025-12-12', 'upcoming', '[]'::jsonb),
        ('Sports and Festival Day', 'A community sports day originally planned to include races, football, and family activities.', 'Sar Bet Area, Lideta Sub-City', '2026-01-05', '2026-02-05', 'canceled', '[]'::jsonb),
        ('Community Clean-up Day', 'Start the year with a community-led effort to refresh parks and residential blocks.', 'Sar Bet Area, Lideta Sub-City', '2026-01-20', '2026-02-20', 'upcoming', '[]'::jsonb),
        ('Youth Coding Workshop', 'A hands-on workshop for local youth to learn basic coding and robotics skills.', 'Digital Service Center, Lideta Sub-City', '2025-12-18', '2025-12-19', 'upcoming', '[]'::jsonb),
        ('Community Health Check', 'Free health screening for residents including blood pressure and glucose tests.', 'Community Clinic, Lideta Sub-City', '2025-12-21', '2025-12-21', 'upcoming', '[]'::jsonb),
        ('Cultural Heritage Day', 'Celebrating local arts, music, and traditional crafts with performances and exhibits.', 'Cultural Center, Lideta Sub-City', '2025-12-23', '2025-12-23', 'upcoming', '[]'::jsonb),
        ('Waste Reduction Campaign', 'Educational event to teach residents about recycling and sustainable waste management.', 'Market Square, Lideta Sub-City', '2025-12-26', '2025-12-27', 'upcoming', '[]'::jsonb),
        ('Public Safety Workshop', 'Interactive sessions on fire safety, first aid, and emergency preparedness.', 'Community Hall, Lideta Sub-City', '2025-12-28', '2025-12-28', 'upcoming', '[]'::jsonb),
        ('Local Farmers Market', 'A one-day market for residents to purchase fresh produce and handmade goods.', 'Town Square, Lideta Sub-City', '2026-01-02', '2026-01-02', 'upcoming', '[]'::jsonb),
        ('Winter Sports Festival', 'Fun winter-themed games and competitions for families and youth.', 'Sports Grounds, Lideta Sub-City', '2026-01-08', '2026-01-09', 'upcoming', '[]'::jsonb),
        ('Art in the Park', 'Outdoor art exhibition showcasing works by local artists and students.', 'Central Park, Lideta Sub-City', '2026-01-12', '2026-01-13', 'upcoming', '[]'::jsonb),
        ('Community Forum on Urban Development', 'Discussion on local infrastructure projects and future city planning initiatives.', 'City Council Hall, Lideta Sub-City', '2026-01-15', '2026-01-15', 'upcoming', '[]'::jsonb);

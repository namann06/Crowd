# EventFlow – Crowd Management System
## Project Overview

EventFlow is a crowd management system designed to monitor, control, and optimize crowd movement during events and in public spaces such as colleges, auditoriums, exhibitions, festivals, and campuses.

The system focuses on safety, efficiency, and real-time monitoring by tracking crowd density, identifying congestion points, and alerting authorities when predefined limits are exceeded.

This project is developed as a solo project with a scalable architecture, making it suitable for both academic evaluation and real-world deployment.
### 🌐 Live Demo
[Visit Live Site](https://eventflow-web.onrender.com)

---
## Objectives

- Monitor crowd density across different zones

- Prevent overcrowding and bottlenecks

- Generate alerts when crowd limits are exceeded

- Store and analyze historical crowd data

- Assist event organizers and authorities in decision-making

## Features

- 📊 Zone-wise crowd monitoring

- 🚨 Real-time alerts for overcrowding

- 🗺️ Crowd flow visualization

- 🕒 Historical data tracking

- 🔐 Admin dashboard for control & monitoring

- 📈 Analytics for post-event analysis

 ## Tech Stack
 ### Frontend
- React
- Tailwind CSS
- JavaScript

### Backend

- Java / Spring Boot

- REST APIs

### Database

- MySQL

### Tools & Technologies

- Git & GitHub

- VS Code 

- Postman (API testing)

  ---

## Project Structure

The project is organized as follows:

```
EventFlow/
│
├── .github/
│   └── java-upgrade/
│       └── logs/
│
├── .vscode/
│   └── (Editor configuration files)
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/crowdmanagement/
│   │       │       ├── config/        # Application & security configuration
│   │       │       ├── controller/    # REST controllers
│   │       │       ├── dto/           # Data Transfer Objects
│   │       │       ├── entity/        # JPA entities
│   │       │       ├── repository/    # Database repositories
│   │       │       └── service/       # Business logic
│   │       │
│   │       └── resources/
│   │           ├── application.properties
│   │           └── static/
│   │
│   ├── target/                        # Compiled backend files
│   └── pom.xml                        # Maven configuration
│
├── frontend/
│   ├── node_modules/                  # Frontend dependencies
│   ├── public/                        # Public assets
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   ├── pages/                     # Application pages
│   │   └── services/                  # API service calls
│   │
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/                       # Project screenshots for README
│   ├── dashboard.png
│   ├── create-event.png
│   ├── alerts.png
│   
│
└── README.md
```
---
## 📄 License
This project is open source and available under the MIT License.
---

## 💬 Feedback
Have ideas or feedback? Feel free to open an issue or contribute via a pull request!

  

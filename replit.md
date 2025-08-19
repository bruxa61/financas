# VintageFinance

## Overview

VintageFinance is a retro-styled financial management web application built with Flask that enables users to track their income and expenses with a vintage aesthetic. The application provides comprehensive financial tracking through transaction management, visual reporting with charts, and user authentication via Replit Auth. Users can add, edit, and categorize transactions, view dashboard analytics, and generate detailed financial reports with vintage-inspired UI design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask web framework with SQLAlchemy ORM for database operations
- **Database**: PostgreSQL with SQLAlchemy models for users, OAuth tokens, and transactions
- **Authentication**: Replit OAuth integration using Flask-Dance for secure user authentication
- **Session Management**: Flask-Login for user session handling with permanent sessions
- **Database Schema**: Three core models - User (with Replit Auth requirements), OAuth (for token storage), and Transaction (for financial records)

### Frontend Architecture
- **Template Engine**: Jinja2 templating with Bootstrap 5 for responsive design
- **Styling**: Custom vintage CSS theme with retro color palette (axolotl green, morning blue, jet stream)
- **JavaScript**: Chart.js for financial visualizations, Feather Icons for consistent iconography
- **Responsive Design**: Bootstrap grid system with custom vintage components and mobile-first approach

### Data Storage
- **Primary Database**: PostgreSQL with connection pooling and pre-ping health checks
- **Models**: User authentication data, transaction records with amounts, categories, dates, and descriptions
- **Relationships**: User-to-transactions one-to-many relationship with cascade delete

### Authentication & Authorization
- **OAuth Provider**: Replit authentication system with mandatory User and OAuth models
- **Session Storage**: Custom UserSessionStorage class for OAuth token management
- **Access Control**: Login requirements for protected routes with user-specific data isolation

## External Dependencies

### Third-Party Services
- **Replit Authentication**: OAuth 2.0 integration for user login and session management
- **PostgreSQL**: Primary database service for persistent data storage

### Frontend Libraries
- **Bootstrap 5**: UI framework for responsive design and components
- **Chart.js**: JavaScript library for rendering financial charts and analytics
- **Feather Icons**: Icon library for consistent visual elements across the application

### Python Packages
- **Flask & Extensions**: Core web framework with SQLAlchemy, Login Manager
- **Flask-Dance**: OAuth client implementation for Replit authentication
- **Werkzeug**: WSGI utilities including ProxyFix for HTTPS URL generation
- **PyJWT**: JSON Web Token handling for authentication flows
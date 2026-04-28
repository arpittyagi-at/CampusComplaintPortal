# Campus Portal Presentation Q&A

Use this document as a viva or demo speaking guide. The answers are written in a simple, confident format.

## 1) Short answer: where is the data stored?

The application uses SQLite, so the main data is stored in a local database file at `database/campus.db` in the project folder.

If the app runs locally, the database file stays inside the project directory.

If the app runs on Render, the database file lives in the service filesystem, which may be reset on redeploy unless persistent disk storage is added.

Passwords are not stored as plain text. They are hashed with bcrypt before saving.

## 2) One-line answer for viva

"My project stores user, complaint, and activity data in a SQLite database file, and passwords are saved as hashed values, not plain text."

## 3) Full project workflow

### A. Login / Signup flow

1. A new student signs up using name, email, and password.
2. The password is hashed with bcrypt.
3. The user row is saved in the `users` table.
4. During login, the email is matched and the entered password is compared with the hashed password.
5. After successful login, the user is stored in the session.

### B. Student complaint flow

1. A student opens the dashboard.
2. The student fills the complaint form with title, category, and description.
3. The complaint is inserted into the `complaints` table with the current student ID.
4. The dashboard shows only that student’s own complaints.
5. The student can edit or delete only unresolved complaints.
6. Every action is written to the `activity_logs` table.

### C. Admin flow

1. The admin logs in with admin credentials.
2. The admin dashboard shows all complaints from all students.
3. The admin can filter, update status, update priority, or delete complaints.
4. The admin can export complaints as CSV.
5. The admin sees recent activity logs and complaint analytics.

### D. Profile flow

1. The student can update the name in the profile section.
2. The email is not editable now.
3. The change is saved in the `users` table.

## 4) Database structure you can explain

### `users`

Stores all student and admin accounts.

Fields:
- `id`
- `name`
- `email`
- `password`
- `role`

### `complaints`

Stores complaint records raised by students.

Fields:
- `id`
- `user_id`
- `title`
- `category`
- `description`
- `status`
- `priority`
- `created_at`

### `activity_logs`

Stores user actions like login, logout, complaint creation, profile update, and admin actions.

Fields:
- `id`
- `user_id`
- `action`
- `created_at`

## 5) Important answers for common questions

### Q: Why did you choose SQLite?

A: SQLite is simple, lightweight, and perfect for a college project or demo. It does not need a separate database server.

### Q: Is the password stored in plain text?

A: No. Passwords are hashed with bcrypt before storing them in the database.

### Q: Can an admin see all complaints?

A: Yes. The admin dashboard fetches all complaints and shows student name, email, title, category, status, priority, and date.

### Q: Can a student see other students’ complaints?

A: No. The student dashboard queries complaints using the logged-in student ID, so it only shows that student’s own records.

### Q: Can a student change their email?

A: No. The profile editor now allows only the name to be updated. The email field is read-only.

### Q: Where are activities stored?

A: In the `activity_logs` table in SQLite. Each record is linked to a user where available.

### Q: What happens on Render redeploy?

A: The code redeploys from GitHub. The SQLite file may be reset if persistent disk is not enabled, so Render is fine for demo use but not ideal for long-term production data storage.

## 6) Suggested viva walkthrough

You can speak in this order:

1. Introduce the project as a Smart Campus Complaint & Service Management Portal.
2. Explain that users sign up, log in, and submit complaints.
3. Explain that complaints are saved in SQLite.
4. Explain that the admin can manage all complaints.
5. Mention that passwords are hashed.
6. Mention that the student dashboard only shows that student’s own complaints and activity.
7. Mention that the profile email is locked to avoid accidental changes.
8. End with deployment on Render.

## 7) If the examiner asks for the exact stored file

You can say:

"The database is a SQLite file named `campus.db` in the `database` folder. The schema is initialized when the app starts, and the data is accessed through the Node.js database helper."

## 8) Short speaking script

"This project uses Node.js, Express, and SQLite. The main persistent data is stored in a local SQLite file in the database folder. User passwords are hashed with bcrypt, and complaints are stored with a foreign key to the logged-in user. Students can only see and manage their own complaints, while the admin can manage all complaints, export CSV, and view analytics. Activity logs are stored separately, and the profile email is read-only to keep the account stable."

## 9) Quick reminder

If you want to answer confidently in one sentence, use this:

"All project data is stored in the SQLite database file `database/campus.db`, with passwords hashed and complaint ownership linked by user ID."

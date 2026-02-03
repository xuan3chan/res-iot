# Face Authentication API Documentation

## Overview

This document describes the Face Authentication system for the Restaurant IoT platform. It covers two main features:

1. **Register Face** - Enrolling a user's face into the system
2. **Face Login** - Authenticating a user using their face with liveness detection

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Register Face](#1-register-face)
3. [Face Login](#2-face-login)
4. [Use Cases](#use-cases)
5. [Frontend Implementation Guide](#frontend-implementation-guide)
6. [Error Handling](#error-handling)

---

## API Endpoints

| Feature             | Method | Endpoint                         | Content-Type          |
| ------------------- | ------ | -------------------------------- | --------------------- |
| Register Admin Face | POST   | `/api/admins/{id}/register-face` | `multipart/form-data` |
| Register User Face  | POST   | `/api/users/{id}/register-face`  | `multipart/form-data` |
| Face Login          | POST   | `/api/auth/face-login`           | `application/json`    |

---

## 1. Register Face

### Description

Registers a face for an admin or user. The system extracts a 512-dimensional face vector from the uploaded image and stores it in the database.

### Endpoint (Admin)

```
POST /api/admins/{id}/register-face
```

### Endpoint (User)

```
POST /api/users/{id}/register-face
```

### Request Headers

```
Content-Type: multipart/form-data
```

### Request Body

| Field  | Type          | Required | Description                               |
| ------ | ------------- | -------- | ----------------------------------------- |
| `file` | File (binary) | Yes      | JPEG or PNG image containing a clear face |

### Example Request (cURL)

```bash
curl -X POST 'http://localhost:3000/api/admins/5f8b5baf-6202-4931-86b1-2cecebb96a17/register-face' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/face-photo.jpg'
```

### Success Response (200 OK)

```json
{
  "id": "5f8b5baf-6202-4931-86b1-2cecebb96a17",
  "email": "admin@example.com",
  "username": "admin_user",
  "name": "Admin User",
  "isActive": true,
  "hasFaceRegistered": true,
  "createdAt": "2026-01-27T13:17:33.199Z",
  "updatedAt": "2026-02-03T08:27:16.774Z"
}
```

### Error Responses

| Status | Error                | Description                                           |
| ------ | -------------------- | ----------------------------------------------------- |
| 400    | `No face detected`   | The uploaded image does not contain a detectable face |
| 404    | `Admin not found`    | The admin ID does not exist                           |
| 502    | `Face Service Error` | The Face AI service is unavailable                    |

---

## 2. Face Login

### Description

Authenticates a user using facial recognition with liveness detection. The client must capture multiple frames during a challenge (e.g., blinking) to prove the user is real and not a photo.

### Endpoint

```
POST /api/auth/face-login
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

| Field             | Type     | Required | Description                                                                   |
| ----------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `frames`          | string[] | Yes      | Array of base64-encoded images (minimum 10 frames)                            |
| `challengeType`   | enum     | Yes      | Type of liveness challenge: `BLINK`, `TURN_HEAD`, `OPEN_MOUTH`, `READ_NUMBER` |
| `challengePassed` | boolean  | Yes      | Whether the frontend detected the challenge was completed                     |
| `deviceId`        | string   | No       | Optional device identifier for audit logging                                  |

### Example Request Body

```json
{
  "frames": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "... (minimum 10 frames)"
  ],
  "challengeType": "BLINK",
  "challengePassed": true,
  "deviceId": "kitchen-tablet-01"
}
```

### Success Response - LOGIN_SUCCESS (200 OK)

```json
{
  "success": true,
  "decision": "LOGIN_SUCCESS",
  "userId": "5f8b5baf-6202-4931-86b1-2cecebb96a17",
  "userName": "Admin User",
  "role": "admin",
  "isLive": true,
  "livenessScore": 0.95,
  "similarity": 0.92,
  "distance": 0.08,
  "message": "Face login successful"
}
```

### Success Response - REQUIRE_STEP_UP (200 OK)

When the face matches but with lower confidence, additional verification is required.

```json
{
  "success": false,
  "decision": "REQUIRE_STEP_UP",
  "userId": "5f8b5baf-6202-4931-86b1-2cecebb96a17",
  "userName": "Admin User",
  "role": "admin",
  "isLive": true,
  "livenessScore": 0.88,
  "similarity": 0.72,
  "distance": 0.38,
  "message": "Additional verification required"
}
```

### Failure Response - DENY (200 OK)

```json
{
  "success": false,
  "decision": "DENY",
  "isLive": false,
  "livenessScore": 0.3,
  "message": "Liveness check failed or no face detected"
}
```

### Decision Logic

| Distance      | Decision          | Action                   |
| ------------- | ----------------- | ------------------------ |
| `< 0.35`      | `LOGIN_SUCCESS`   | Grant access immediately |
| `0.35 - 0.45` | `REQUIRE_STEP_UP` | Ask for password or OTP  |
| `> 0.45`      | `DENY`            | Reject login attempt     |

---

## Use Cases

### Use Case 1: Admin Registers Their Face

**Actor:** Admin User  
**Precondition:** Admin is logged in and has an existing account  
**Goal:** Register face for future face-based login

#### Main Flow:

1. Admin navigates to **Profile Settings > Face Registration**
2. System displays camera preview with face alignment guide
3. Admin positions their face within the guide
4. Admin clicks "Capture Photo" button
5. Frontend captures a clear image of the admin's face
6. Frontend sends image to `POST /api/admins/{id}/register-face`
7. System processes the image and extracts face vector
8. System stores the face vector and updates `hasFaceRegistered = true`
9. System displays success message: "Face registered successfully"

#### Alternative Flow - No Face Detected:

- 6a. System returns error "No face detected"
- 6b. Frontend displays: "Please position your face clearly in the frame"
- 6c. Return to step 3

#### UI Requirements:

- Camera preview with face alignment overlay (oval guide)
- Good lighting indicator
- "Capture" button
- Preview of captured image before submission
- Retry option if capture is not satisfactory

---

### Use Case 2: Admin Logs In Using Face

**Actor:** Admin User  
**Precondition:** Admin has registered their face  
**Goal:** Authenticate using face recognition

#### Main Flow:

1. Admin opens the application and selects "Face Login"
2. System displays camera preview
3. System randomly selects a challenge type (e.g., "Please blink twice")
4. Admin performs the challenge while looking at the camera
5. Frontend captures 10-30 frames during the challenge
6. Frontend detects if challenge was completed (e.g., blink detected)
7. Frontend sends frames to `POST /api/auth/face-login`
8. System performs liveness check and face matching
9. System returns `LOGIN_SUCCESS` with user details
10. Frontend stores auth token and redirects to dashboard

#### Alternative Flow - Step-Up Required:

- 9a. System returns `REQUIRE_STEP_UP`
- 9b. Frontend displays password or OTP input
- 9c. Admin enters secondary credential
- 9d. System verifies and grants access

#### Alternative Flow - Liveness Failed:

- 8a. System detects potential spoofing (photo/video attack)
- 8b. System returns `DENY` with message "Liveness check failed"
- 8c. Frontend displays: "Please try again with a live face"
- 8d. Return to step 2

#### Alternative Flow - Face Not Recognized:

- 8a. Face vector does not match any registered user
- 8b. System returns `DENY` with message "Face does not match"
- 8c. Frontend displays: "Face not recognized. Please use password login."

---

## Frontend Implementation Guide

### 1. Camera Integration

Use the browser's MediaStream API or a React library like `react-webcam`:

```tsx
import Webcam from 'react-webcam';

const FaceCapture = () => {
  const webcamRef = useRef<Webcam>(null);

  const captureFrame = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    // imageSrc is a base64 string like "data:image/jpeg;base64,..."
    return imageSrc;
  };

  return (
    <Webcam
      ref={webcamRef}
      audio={false}
      screenshotFormat="image/jpeg"
      videoConstraints={{
        width: 640,
        height: 480,
        facingMode: 'user',
      }}
    />
  );
};
```

### 2. Frame Collection for Liveness

```tsx
const collectFrames = async (duration: number = 3000): Promise<string[]> => {
  const frames: string[] = [];
  const interval = 100; // Capture every 100ms

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const frame = captureFrame();
      if (frame) frames.push(frame);
    }, interval);

    setTimeout(() => {
      clearInterval(timer);
      resolve(frames);
    }, duration);
  });
};
```

### 3. Challenge Types

| Challenge     | Frontend Detection           | User Instruction                 |
| ------------- | ---------------------------- | -------------------------------- |
| `BLINK`       | Eye aspect ratio changes     | "Please blink twice"             |
| `TURN_HEAD`   | Face position shift          | "Turn your head left then right" |
| `OPEN_MOUTH`  | Mouth aspect ratio           | "Please open your mouth"         |
| `READ_NUMBER` | Voice recognition (optional) | "Please say the number: 7 3 9"   |

### 4. API Integration Example

```tsx
// Register Face
const registerFace = async (adminId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/admins/${adminId}/register-face`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

// Face Login
const faceLogin = async (frames: string[], challengeType: string) => {
  const response = await fetch('/api/auth/face-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frames,
      challengeType,
      challengePassed: true,
      deviceId: 'web-browser',
    }),
  });

  return response.json();
};
```

---

## Error Handling

### Common Error Codes

| HTTP Status | Error Message              | Cause                     | Frontend Action          |
| ----------- | -------------------------- | ------------------------- | ------------------------ |
| 400         | No face detected           | Image has no visible face | Ask user to retry        |
| 400         | Minimum 10 frames required | Not enough frames sent    | Capture for longer       |
| 404         | Admin not found            | Invalid admin ID          | Check user session       |
| 502         | Face Service Error         | AI service unavailable    | Show maintenance message |
| 500         | Internal server error      | Unexpected error          | Log and retry            |

### Retry Strategy

- Allow up to 3 retries for face registration
- Allow up to 5 retries for face login before suggesting password login
- Implement exponential backoff for server errors

---

## Security Considerations

1. **HTTPS Only** - All face data must be transmitted over HTTPS
2. **No Client-Side Storage** - Never store face images or vectors on the client
3. **Rate Limiting** - Face login is rate-limited to 5 attempts per minute
4. **Audit Logging** - All face login attempts are logged with IP and device info
5. **Liveness Required** - Single-frame login (photo login) is NOT supported

---

## Appendix: Response Type Definitions

```typescript
interface FaceLoginResponse {
  success: boolean;
  decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';
  userId?: string;
  userName?: string;
  role?: 'admin' | 'manager' | 'kitchen_staff' | 'waiter' | 'customer';
  isLive: boolean;
  livenessScore: number;
  similarity?: number;
  distance?: number;
  message: string;
}

interface AdminResponse {
  id: string;
  email: string;
  username: string;
  name: string;
  isActive: boolean;
  hasFaceRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}
```

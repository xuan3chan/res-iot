export enum FaceVerificationConfig {
  // Thresholds (lower distance = more similar)
  // A real person typically has distance < 0.25 to their registered face
  // Photo spoofing often has higher distance due to angle/lighting differences
  SAME_PERSON_THRESHOLD = 0.35, // Very strict: need high similarity to pass
  STEP_UP_THRESHOLD = 0.4, // Require step-up verification if between 0.25-0.35
}

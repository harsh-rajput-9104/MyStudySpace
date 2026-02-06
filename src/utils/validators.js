/**
 * Form Validation Utilities
 * All validation functions return an error message string if invalid, or null if valid
 */

/**
 * Validates required text field
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates subject name (required, no duplicates)
 * @param {string} name - Subject name
 * @param {Array} existingSubjects - Array of existing subjects
 * @param {string} currentId - ID of current subject (for edit mode)
 * @returns {string|null} Error message or null
 */
export const validateSubjectName = (name, existingSubjects = [], currentId = null) => {
  const requiredError = validateRequired(name, 'Subject name');
  if (requiredError) return requiredError;

  // Check for duplicates
  const duplicate = existingSubjects.find(
    subject => subject.name.toLowerCase() === name.trim().toLowerCase() && subject.id !== currentId
  );

  if (duplicate) {
    return 'A subject with this name already exists';
  }

  return null;
};

/**
 * Validates date field
 * @param {string} date - Date string
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null
 */
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} is invalid`;
  }

  return null;
};

/**
 * Validates assignment form
 * @param {Object} formData - Assignment form data
 * @param {Array} subjects - Array of subjects
 * @returns {Object} Object with field errors
 */
export const validateAssignment = (formData, subjects = []) => {
  const errors = {};

  // Validate subject
  if (!formData.subjectId) {
    errors.subjectId = 'Please select a subject';
  } else if (!subjects.find(s => s.id === formData.subjectId)) {
    errors.subjectId = 'Selected subject does not exist';
  }

  // Validate title
  const titleError = validateRequired(formData.title, 'Assignment title');
  if (titleError) errors.title = titleError;

  // Validate due date
  const dateError = validateDate(formData.dueDate, 'Due date');
  if (dateError) errors.dueDate = dateError;

  return errors;
};

/**
 * Validates exam form
 * @param {Object} formData - Exam form data
 * @param {Array} subjects - Array of subjects
 * @returns {Object} Object with field errors
 */
export const validateExam = (formData, subjects = []) => {
  const errors = {};

  // Validate subject
  if (!formData.subjectId) {
    errors.subjectId = 'Please select a subject';
  } else if (!subjects.find(s => s.id === formData.subjectId)) {
    errors.subjectId = 'Selected subject does not exist';
  }

  // Validate exam name
  const nameError = validateRequired(formData.name, 'Exam name');
  if (nameError) errors.name = nameError;

  // Validate exam date
  const dateError = validateDate(formData.examDate, 'Exam date');
  if (dateError) errors.examDate = dateError;

  return errors;
};

/**
 * Validates profile form
 * @param {Object} formData - Profile form data
 * @returns {Object} Object with field errors
 */
export const validateProfile = (formData) => {
  const errors = {};

  // Validate name (existing field)
  const nameError = validateRequired(formData.name, 'Name');
  if (nameError) errors.name = nameError;

  // Validate branch (existing field)
  const branchError = validateRequired(formData.branch, 'Branch');
  if (branchError) errors.branch = branchError;

  // Validate semester (existing field)
  const semesterError = validateRequired(formData.semester, 'Semester');
  if (semesterError) errors.semester = semesterError;

  // Validate enrollment number (new field)
  const enrollmentError = validateRequired(formData.enrollmentNo, 'Enrollment Number');
  if (enrollmentError) errors.enrollmentNo = enrollmentError;

  // Validate class/section (new field)
  const classError = validateRequired(formData.classSection, 'Class/Section');
  if (classError) errors.classSection = classError;

  // Validate college name (new field)
  const collegeError = validateRequired(formData.collegeName, 'College Name');
  if (collegeError) {
    errors.collegeName = collegeError;
  } else if (formData.collegeName.trim().length < 3) {
    errors.collegeName = 'College Name must be at least 3 characters';
  }

  // Validate university name (new field)
  const universityError = validateRequired(formData.universityName, 'University Name');
  if (universityError) {
    errors.universityName = universityError;
  } else if (formData.universityName.trim().length < 3) {
    errors.universityName = 'University Name must be at least 3 characters';
  }

  // Validate avatar selection (new field)
  if (!formData.avatarId) {
    errors.avatarId = 'Please select an avatar';
  }

  return errors;
};

/**
 * Checks if an object has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean} True if there are errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Checks if a date is in the past
 * @param {string} dateString - Date string
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
};

/**
 * Checks if a date is upcoming (within next 7 days)
 * @param {string} dateString - Date string
 * @returns {boolean} True if date is upcoming
 */
export const isUpcoming = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  return date >= today && date <= sevenDaysFromNow;
};

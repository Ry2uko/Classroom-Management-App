import axiosInstance from '../services/axiosInstance';

const fetchData = async (path) => {
  try {
    const res = await axiosInstance.get(path);
    return res.data;
  } catch (err) {
    console.error('Error fetching data: ', err);
    throw err;  // Re-throw to handle errors in the component
  }
};

// fetch user data given user id
const fetchUserData = async (userId) => {
  try {
    const userData = await fetchData(`users/${userId}`);
    return userData;  
  } catch (err) {
    console.error('Error fetching user data: ', err);
    throw err;
  }
}

// fetch classroom data given classroom id
const fetchClassroomData = async (classroomId) => {
  try {
    const classroomData = await fetchData(`classrooms/${classroomId}`);

    return classroomData;
  } catch (err) {
    console.error('Error fetching classroom data: ', err);
    throw err;
  }
};

// fetch course data given course id
const fetchCourseData = async (courseId) => {
  try {
    const courseData = await fetchData(`courses/${courseId}`);
    return courseData;
  } catch (err) {
    console.error('Error fetching course data: ', err);
    throw err;
  }
};

// fetch content data given content id
const fetchContentData = async (contentId) => {
  try {
    const contentData = await fetchData(`contents/${contentId}`);
    return contentData;
  } catch (err) {
    console.error('Error fetching content data: ', err);
    throw err;
  }
};  

export default fetchData;
export { 
  fetchUserData, 
  fetchClassroomData, 
  fetchContentData, 
  fetchCourseData 
};
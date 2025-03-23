import fetchData from '../utils/apiUtils';

const fetchHomeData = async (userId) => {
  /* Fetches classroom and courses data */
  
  try {
  const userClassroom = await fetchData(`/classrooms?user=${userId}`);
  const courses = await fetchData(`/courses?strand=${userClassroom[0].strand}`);
  return {
    userClassroom: userClassroom[0],
    courses
  };
  } catch (err) {
  console.error('Error fetching home data: ', err);
  throw err;
  }
};

export { fetchHomeData };
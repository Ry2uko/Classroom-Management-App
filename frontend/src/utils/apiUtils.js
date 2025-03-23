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

const fetchUserData = async (userId) => {
  try {
  const userData = await fetchData(`users/${userId}`);
  return userData;  
  } catch (err) {
  console.error('Error fetching user data: ', err);
  throw err;
  }
}

export default fetchData;
export { fetchUserData };
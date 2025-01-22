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

export default fetchData;
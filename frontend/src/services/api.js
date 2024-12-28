import axios from 'axios';

const getUsers = async (params) => {
  try {
    let param_string = Object.keys(params)
    .map((key, i) => `${i === 0 ? '?' : '&'}${key}=${params[key]}`)
    .join('');

    const response = await axios.get(`http://127.0.0.1:8000/users${param_string}`)
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};  

const getClassrooms = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/classrooms');
    const data = response.data;

    const classroomData = await Promise.all(
      data.map(async (classroom) => {
        const users =  await getUsers({ 'classroom': classroom.id });

        // Sort users by type
        const userTypeOrder = ['super_admin', 'admin', 'basic'];
        users.sort((a, b) => userTypeOrder.indexOf(a.type) - userTypeOrder.indexOf(b.type));

        return {
          ...classroom,
          'students': users,
          'admins': users.filter(user => user.type === 'admin' || user.type === 'super_admin').map(user => user.id),
        };
      })
    );

    return classroomData;
  } catch (err) {
    console.error(err);
    throw err;
  }

}

export { getClassrooms };
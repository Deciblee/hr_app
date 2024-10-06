import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Container, Box, Typography, MenuItem, IconButton, FormControl, InputLabel, Select, Grid
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import axios from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [employee, setEmployee] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    email: '',
    phone_number: '',
    address: '',
    passport_info: {
      passport_number: '',
      issued_by: '',
      date_issued: '',
      date_expiry: ''
    },
    family: {
      number_of_children: 0,
      marital_status: ''
    },
    educations: [],
    work_experiences: [],
    skills: [],
    certifications: [],
    languages: [],
  });
  const [error, setError] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCertifications, setAvailableCertifications] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    // Загрузка справочных данных
    axios.get('/skills/')
      .then(response => {
        setAvailableSkills(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке навыков', error);
      });

    axios.get('/certifications/')
      .then(response => {
        setAvailableCertifications(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке сертификатов', error);
      });

    axios.get('/languages/')
      .then(response => {
        setAvailableLanguages(response.data);
      })
      .catch(error => {
        console.error('Ошибка при загрузке языков', error);
      });

    if (id) {
      // Режим редактирования
      setIsEditMode(true);
      axios.get(`/employees/${id}/`)
        .then(response => {
          // Преобразуем данные сотрудника для заполнения формы
          const employeeData = response.data;
          setEmployee({
            ...employeeData,
            date_of_birth: employeeData.date_of_birth || '',
            passport_info: {
              ...employeeData.passport_info,
              date_issued: employeeData.passport_info?.date_issued || '',
              date_expiry: employeeData.passport_info?.date_expiry || ''
            },
            educations: employeeData.educations || [],
            work_experiences: employeeData.work_experiences || [],
            skills: employeeData.skills_info
              ? employeeData.skills_info.map(skillItem => ({ skill_id: skillItem.skill.id }))
              : [],
            certifications: employeeData.certifications_info
              ? employeeData.certifications_info.map(certItem => ({
                  certification_id: certItem.certification.id,
                  date_obtained: certItem.date_obtained
                }))
              : [],
            languages: employeeData.languages_info
              ? employeeData.languages_info.map(langItem => ({
                  language_id: langItem.language.id,
                  proficiency_level: langItem.proficiency_level
                }))
              : [],
          });
        })
        .catch(error => console.error('Ошибка при загрузке данных сотрудника', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (index, e, key) => {
    const updatedArray = [...employee[key]];
    updatedArray[index] = { ...updatedArray[index], [e.target.name]: e.target.value };
    setEmployee({ ...employee, [key]: updatedArray });
  };

  const handlePassportInfoChange = (e) => {
    setEmployee({
      ...employee,
      passport_info: { ...employee.passport_info, [e.target.name]: e.target.value }
    });
  };

  const handleFamilyChange = (e) => {
    setEmployee({
      ...employee,
      family: { ...employee.family, [e.target.name]: e.target.value }
    });
  };

  const handleAddField = (key) => {
    const newField =
      key === 'educations'
        ? { education_level: '', institution: '', graduation_year: '', specialty: '' }
        : key === 'work_experiences'
          ? { employer: '', position: '', start_date: '', end_date: '', responsibilities: '' }
          : key === 'certifications'
            ? { certification_id: '', date_obtained: '' }
            : key === 'languages'
              ? { language_id: '', proficiency_level: '' }
              : key === 'skills'
                ? { skill_id: '' }
                : '';
    setEmployee({ ...employee, [key]: [...employee[key], newField] });
  };

  const handleRemoveField = (key, index) => {
    const updatedArray = [...employee[key]];
    updatedArray.splice(index, 1);
    setEmployee({ ...employee, [key]: updatedArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...employee,
        skills: employee.skills.filter((skill) => skill.skill_id),
        certifications: employee.certifications.filter(
          (cert) => cert.certification_id && cert.date_obtained
        ),
        languages: employee.languages.filter(
          (lang) => lang.language_id && lang.proficiency_level
        ),
        educations: employee.educations.filter(
          (edu) =>
            edu.education_level &&
            edu.institution &&
            edu.graduation_year &&
            edu.specialty
        ),
        work_experiences: employee.work_experiences.filter(
          (work) =>
            work.employer &&
            work.position &&
            work.start_date
        ),
      };

      if (isEditMode) {
        await axios.put(`/employees/${id}/`, payload);
        setError('');
        navigate(`/employees/${id}/`);
      } else {
        const response = await axios.post('/employees/', payload);
        setError('');
        navigate(`/employees/${response.data.id}/`);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(
          'Произошла ошибка при сохранении сотрудника.' ||
          error.response.data.name?.[0]
        );
      } else {
        setError('Произошла ошибка сети. Проверьте соединение и попробуйте снова.');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
        </Typography>
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          {/* Личная информация */}
          <Box mb={4}>
            <Typography variant="h6">Личная информация</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Имя"
                  name="first_name"
                  value={employee.first_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Фамилия"
                  name="last_name"
                  value={employee.last_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Отчество"
                  name="patronymic"
                  value={employee.patronymic}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Дата рождения"
                  name="date_of_birth"
                  type="date"
                  value={employee.date_of_birth}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>Пол</InputLabel>
                  <Select
                    label="Пол"
                    name="gender"
                    value={employee.gender}
                    onChange={handleChange}
                  >
                    <MenuItem value="M">Мужской</MenuItem>
                    <MenuItem value="F">Женский</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Гражданство"
                  name="nationality"
                  value={employee.nationality}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Электронная почта"
                  name="email"
                  type="email"
                  value={employee.email}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Номер телефона"
                  name="phone_number"
                  value={employee.phone_number}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Адрес проживания"
                  name="address"
                  value={employee.address}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Паспортная информация */}
          <Box mb={4}>
            <Typography variant="h6">Паспортная информация</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Номер паспорта"
                  name="passport_number"
                  value={employee.passport_info.passport_number}
                  onChange={handlePassportInfoChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Кем выдан"
                  name="issued_by"
                  value={employee.passport_info.issued_by}
                  onChange={handlePassportInfoChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дата выдачи"
                  name="date_issued"
                  type="date"
                  value={employee.passport_info.date_issued}
                  onChange={handlePassportInfoChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Срок действия"
                  name="date_expiry"
                  type="date"
                  value={employee.passport_info.date_expiry}
                  onChange={handlePassportInfoChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Семейная информация */}
          <Box mb={4}>
            <Typography variant="h6">Семейное положение</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Семейное положение</InputLabel>
                  <Select
                    label="Семейное положение"
                    name="marital_status"
                    value={employee.family.marital_status}
                    onChange={handleFamilyChange}
                  >
                    <MenuItem value="single">Не женат/Не замужем</MenuItem>
                    <MenuItem value="married">Женат/Замужем</MenuItem>
                    <MenuItem value="divorced">Разведен/Разведена</MenuItem>
                    <MenuItem value="widowed">Вдовец/Вдова</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Количество детей"
                  name="number_of_children"
                  type="number"
                  value={employee.family.number_of_children}
                  onChange={handleFamilyChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Образование */}
          <Box mb={4}>
            <Typography variant="h6">Образование</Typography>
            {employee.educations.map((education, index) => (
              <Box key={index} mb={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Уровень образования"
                      name="education_level"
                      value={education.education_level}
                      onChange={(e) => handleNestedChange(index, e, 'educations')}
                      select
                      fullWidth
                      required
                    >
                      <MenuItem value="secondary">Среднее</MenuItem>
                      <MenuItem value="bachelor">Бакалавр</MenuItem>
                      <MenuItem value="master">Магистр</MenuItem>
                      <MenuItem value="phd">Доктор наук</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Учебное заведение"
                      name="institution"
                      value={education.institution}
                      onChange={(e) => handleNestedChange(index, e, 'educations')}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Год окончания"
                      name="graduation_year"
                      type="number"
                      value={education.graduation_year}
                      onChange={(e) => handleNestedChange(index, e, 'educations')}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Специальность"
                      name="specialty"
                      value={education.specialty}
                      onChange={(e) => handleNestedChange(index, e, 'educations')}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>
                <IconButton onClick={() => handleRemoveField('educations', index)} color="secondary">
                  <RemoveCircleIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => handleAddField('educations')} color="primary" startIcon={<AddCircleIcon />}>
              Добавить образование
            </Button>
          </Box>

          {/* Опыт работы */}
          <Box mb={4}>
            <Typography variant="h6">Опыт работы</Typography>
            {employee.work_experiences.map((work, index) => (
              <Box key={index} mb={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Работодатель"
                      name="employer"
                      value={work.employer}
                      onChange={(e) => handleNestedChange(index, e, 'work_experiences')}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Должность"
                      name="position"
                      value={work.position}
                      onChange={(e) => handleNestedChange(index, e, 'work_experiences')}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Дата начала работы"
                      name="start_date"
                      type="date"
                      value={work.start_date}
                      onChange={(e) => handleNestedChange(index, e, 'work_experiences')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Дата окончания работы"
                      name="end_date"
                      type="date"
                      value={work.end_date}
                      onChange={(e) => handleNestedChange(index, e, 'work_experiences')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Обязанности"
                      name="responsibilities"
                      value={work.responsibilities}
                      onChange={(e) => handleNestedChange(index, e, 'work_experiences')}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                <IconButton onClick={() => handleRemoveField('work_experiences', index)} color="secondary">
                  <RemoveCircleIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={() => handleAddField('work_experiences')} color="primary" startIcon={<AddCircleIcon />}>
              Добавить опыт работы
            </Button>
          </Box>

          {/* Навыки */}
          <Box mb={4}>
            <Typography variant="h6">Навыки</Typography>
            {employee.skills.map((skill, index) => (
              <Box key={index} mb={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={10}>
                    <FormControl fullWidth>
                      <InputLabel>Навык</InputLabel>
                      <Select
                        label="Навык"
                        name="skill_id"
                        value={skill.skill_id}
                        onChange={(e) => handleNestedChange(index, e, 'skills')}
                      >
                        {availableSkills.map((availableSkill) => (
                          <MenuItem key={availableSkill.id} value={availableSkill.id}>
                            {availableSkill.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton onClick={() => handleRemoveField('skills', index)} color="secondary">
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={() => handleAddField('skills')} color="primary" startIcon={<AddCircleIcon />}>
              Добавить навык
            </Button>
          </Box>

          {/* Сертификаты */}
          <Box mb={4}>
            <Typography variant="h6">Сертификаты</Typography>
            {employee.certifications.map((certification, index) => (
              <Box key={index} mb={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth>
                      <InputLabel>Сертификат</InputLabel>
                      <Select
                        label="Сертификат"
                        name="certification_id"
                        value={certification.certification_id}
                        onChange={(e) => handleNestedChange(index, e, 'certifications')}
                      >
                        {availableCertifications.map((cert) => (
                          <MenuItem key={cert.id} value={cert.id}>
                            {cert.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Дата получения"
                      name="date_obtained"
                      type="date"
                      value={certification.date_obtained}
                      onChange={(e) => handleNestedChange(index, e, 'certifications')}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton onClick={() => handleRemoveField('certifications', index)} color="secondary">
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={() => handleAddField('certifications')} color="primary" startIcon={<AddCircleIcon />}>
              Добавить сертификат
            </Button>
          </Box>

          {/* Языки */}
          <Box mb={4}>
            <Typography variant="h6">Языки</Typography>
            {employee.languages.map((language, index) => (
              <Box key={index} mb={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Язык</InputLabel>
                      <Select
                        label="Язык"
                        name="language_id"
                        value={language.language_id}
                        onChange={(e) => handleNestedChange(index, e, 'languages')}
                      >
                        {availableLanguages.map((lang) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Уровень владения</InputLabel>
                      <Select
                        label="Уровень владения"
                        name="proficiency_level"
                        value={language.proficiency_level}
                        onChange={(e) => handleNestedChange(index, e, 'languages')}
                      >
                        <MenuItem value="beginner">Начальный</MenuItem>
                        <MenuItem value="intermediate">Средний</MenuItem>
                        <MenuItem value="advanced">Продвинутый</MenuItem>
                        <MenuItem value="native">Родной</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton onClick={() => handleRemoveField('languages', index)} color="secondary">
                      <RemoveCircleIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button onClick={() => handleAddField('languages')} color="primary" startIcon={<AddCircleIcon />}>
              Добавить язык
            </Button>
          </Box>

          {/* Кнопка отправки */}
          <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
            {isEditMode ? 'Сохранить изменения' : 'Добавить сотрудника'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default EmployeeForm;

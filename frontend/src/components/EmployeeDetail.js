import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../services/api';
import { Container, Typography, Box, Card, CardContent, Grid2, Button } from '@mui/material';

function EmployeeDetail() {
	const { id } = useParams();
	const [employee, setEmployee] = useState(null);

	useEffect(() => {
		axios.get(`/employees/${id}/`)
			.then(response => setEmployee(response.data))
			.catch(error => console.error(error));
	}, [id]);

	if (!employee) return <div>Loading...</div>;

	return (
		<Container maxWidth="md">
			<Box my={4}>
				<Typography variant="h4" component="h1" gutterBottom>
					{employee.first_name} {employee.last_name} {employee.patronymic}
				</Typography>
				<Grid2 container spacing={2}>
					<Grid2 item xs={12} sm={6}>
						<Typography><strong>Дата рождения:</strong> {employee.date_of_birth}</Typography>
						<Typography><strong>Пол:</strong> {employee.gender === 'M' ? 'Мужской' : 'Женский'}</Typography>
						<Typography><strong>Гражданство:</strong> {employee.nationality}</Typography>
						<Typography><strong>Электронная почта:</strong> {employee.email}</Typography>
						<Typography><strong>Номер телефона:</strong> {employee.phone_number}</Typography>
						<Typography><strong>Адрес проживания:</strong> {employee.address}</Typography>
					</Grid2>
				</Grid2>

				{/* Паспортная информация */}
				{employee.passport_info && (
					<Box mt={4}>
						<Typography variant="h5">Паспортная информация</Typography>
						<Typography><strong>Номер паспорта:</strong> {employee.passport_info.passport_number}</Typography>
						<Typography><strong>Кем выдан:</strong> {employee.passport_info.issued_by}</Typography>
						<Typography><strong>Дата выдачи:</strong> {employee.passport_info.date_issued}</Typography>
						<Typography><strong>Срок действия:</strong> {employee.passport_info.date_expiry}</Typography>
					</Box>
				)}

				{/* Семейное положение */}
				{employee.family && (
					<Box mt={4}>
						<Typography variant="h5">Семейная информация</Typography>
						<Typography><strong>Семейное положение:</strong> {employee.family.marital_status}</Typography>
						<Typography><strong>Количество детей:</strong> {employee.family.number_of_children}</Typography>
					</Box>
				)}

				{/* Образование */}
				{employee.educations && employee.educations.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5">Образование</Typography>
						{employee.educations.map((education, index) => (
							<Card key={index} variant="outlined" sx={{ mb: 2 }}>
								<CardContent>
									<Typography><strong>Учебное заведение:</strong> {education.institution}</Typography>
									<Typography><strong>Уровень образования:</strong> {education.education_level}</Typography>
									<Typography><strong>Год окончания:</strong> {education.graduation_year}</Typography>
									<Typography><strong>Специальность:</strong> {education.specialty}</Typography>
								</CardContent>
							</Card>
						))}
					</Box>
				)}

				{/* Опыт работы */}
				{employee.work_experiences && employee.work_experiences.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5">Опыт работы</Typography>
						{employee.work_experiences.map((work, index) => (
							<Card key={index} variant="outlined" sx={{ mb: 2 }}>
								<CardContent>
									<Typography><strong>Работодатель:</strong> {work.employer}</Typography>
									<Typography><strong>Должность:</strong> {work.position}</Typography>
									<Typography><strong>Дата начала работы:</strong> {work.start_date}</Typography>
									<Typography><strong>Дата окончания работы:</strong> {work.end_date || 'Текущая'}</Typography>
									<Typography><strong>Обязанности:</strong> {work.responsibilities}</Typography>
								</CardContent>
							</Card>
						))}
					</Box>
				)}

				{/* Навыки */}
				{employee.skills_info && employee.skills_info.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5">Навыки</Typography>
						{employee.skills_info.map((skillItem, index) => (
							<Typography key={index}>- {skillItem.skill.name}</Typography>
						))}
					</Box>
				)}

				{/* Сертификаты */}
				{employee.certifications_info && employee.certifications_info.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5">Сертификаты</Typography>
						{employee.certifications_info.map((certificationItem, index) => (
							<Typography key={index}>- {certificationItem.certification.name} (Дата получения: {certificationItem.date_obtained})</Typography>
						))}
					</Box>
				)}

				{/* Языки */}
				{employee.languages_info && employee.languages_info.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5">Языки</Typography>
						{employee.languages_info.map((languageItem, index) => (
							<Typography key={index}>- {languageItem.language.name} ({languageItem.proficiency_level})</Typography>
						))}
					</Box>
				)}
				<Box mt={4}>
					<Button
						variant="contained"
						color="primary"
						component={Link}
						to={`/employees/${id}/edit`}
					>
						Редактировать
					</Button>
				</Box>
			</Box>
		</Container>
	);
}

export default EmployeeDetail;
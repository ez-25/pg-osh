'use client';

import React, { useEffect, useState } from 'react';

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  const handleAddStudent = async () => {
    if (!name || !age) return alert('이름과 나이를 모두 입력하세요.');

    const response = await fetch('http://localhost:4002/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: parseInt(age) })
    });

    if (response.ok) {
      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setName('');
      setAge('');
      setSelectedTeam('');

      if (selectedTeam) {
        const team = teams.find(t => t.id === parseInt(selectedTeam));
        if (team) {
          await fetch(`http://localhost:4002/teams/${team.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentsID: [...team.studentsID, newStudent.id]
            })
          });
          // Update teams state after patch
          setTeams(teams.map(t => t.id === team.id ? { ...team, studentsID: [...team.studentsID, newStudent.id] } : t));
        }
      }
    }
  };

  useEffect(() => {
    fetch('http://localhost:4002/students')
      .then(res => res.json())
      .then(data => setStudents(data));

    fetch('http://localhost:4002/teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>학생 목록</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="나이"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: 8, marginRight: 8, width: 80 }}
        />
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        >
          <option value="">팀 선택</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.teamname || team.title}
            </option>
          ))}
        </select>
        <button onClick={handleAddStudent} style={{ padding: '8px 16px' }}>
          학생 추가
        </button>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>이름</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>나이</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{student.id}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{student.name}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{student.age}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <h2 style={{ marginTop: 40 }}>팀 목록</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>팀 이름</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>학생 이름 목록</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{team.id}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{team.teamname || team.title}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
                {team.studentsID
                  .map(id => students.find(s => Number(s.id) === Number(id))?.name)
                  .filter(Boolean)
                  .join(', ')
                }
              </td>
            </tr>
          ))}
          {teams.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>
                팀이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditorPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (formId) {
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`https://form-1-backend-1.onrender.com/api/forms/${formId}`);
      if (!response.ok) throw new Error('Could not fetch form');
      const data = await response.json();
      setFormTitle(data.title);
      setQuestions(data.questions.map(q => ({ ...q, id: q._id || Date.now() + Math.random() })));
    } catch (error) {
      console.error("Failed to fetch form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setFormTitle(e.target.value);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'text',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, key, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [key]: value } : q
    ));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveForm = async () => {
    const formData = {
      title: formTitle,
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
      })),
    };

    try {
      const response = await fetch('https://form-1-backend-1.onrender.com/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save form');
      const savedForm = await response.json();
      navigate(`/forms/${savedForm._id}`);
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="editor-page">
      <h1>Form Editor</h1>
      <input
        type="text"
        placeholder="Form Title"
        value={formTitle}
        onChange={handleTitleChange}
      />
      <div>
        {questions.map((q) => (
          <div key={q.id} className="question">
            <input
              type="text"
              placeholder="Question text"
              value={q.text}
              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
            />
            <select
              value={q.type}
              onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
            >
              <option value="text">Text</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <button onClick={() => removeQuestion(q.id)}>Remove</button>
          </div>
        ))}
      </div>
      <button onClick={addQuestion}>Add Question</button>
      <button onClick={saveForm}>Save Form</button>
    </div>
  );
}

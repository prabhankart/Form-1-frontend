import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';
import { FileType, MessageSquareQuote, CheckSquare } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const EditorPage = () => {
  const { formId } = useParams();
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // THIS IS THE CORRECTED LOGIC
  useEffect(() => {
    // Only fetch if the formId is real (not 'new')
    if (formId && formId !== 'new') {
      setLoading(true);
      const fetchForm = async () => {
        try {
          // Use the correct live backend URL
          const backendUrl = 'https://form-1-backend-1.onrender.com'; // Make sure this is your correct Render URL
          const response = await fetch(`${backendUrl}/api/forms/${formId}`);
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
      fetchForm();
    }
  }, [formId]);

  // All other functions (createNewQuestion, addQuestion, etc.) remain the same
  const createNewQuestion = (type) => {
    return {
        id: Date.now(),
        questionType: type,
        questionTitle: '',
        description: '',
        points: 1,
        image: '',
        ...(type === 'Categorize' && { categories: ['Category 1'], items: [{ text: 'Item 1', category: 'Category 1' }] }),
        ...(type === 'Cloze' && { clozeSentence: '', clozeOptions: [] }),
        ...(type === 'Comprehension' && { passage: '', mcqs: [{ question: '', options: [''], correctAnswer: 0 }] }),
      };
  };
  const addQuestion = (type) => { setQuestions(q => [...q, createNewQuestion(type)]); };
  const addQuestionBelow = (index, type) => {
      const newQuestion = createNewQuestion(type);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
  };
  const updateQuestion = (id, updatedData) => { setQuestions(questions.map(q => (q.id === id ? { ...q, ...updatedData } : q))); };
  const deleteQuestion = (id) => { setQuestions(questions.filter(q => q.id !== id)); };
  const copyQuestion = (id) => {
    const questionToCopy = questions.find(q => q.id === id);
    if (questionToCopy) {
      const newQuestion = { ...questionToCopy, id: Date.now() };
      const index = questions.findIndex(q => q.id === id);
      const newQuestions = [...questions];
      newQuestions.splice(index + 1, 0, newQuestion);
      setQuestions(newQuestions);
    }
  };
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const saveForm = async () => { 
      const backendUrl = 'https://form-1-backend-1.onrender.com'; // Make sure this is your correct Render URL
      const formData = {
        title: formTitle,
        questions: questions,
      };
      try {
        const response = await fetch(`${backendUrl}/api/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Something went wrong');
        }
        alert(`Form saved successfully! Form ID: ${result.formId}`);
      } catch (error) {
        console.error('Failed to save form:', error);
        alert(`Error: ${error.message}`);
      }
  };

  if (loading) {
    return <div className="text-center p-12 font-semibold text-lg">Loading Editor...</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 pb-6 mb-8">
            <input
              id="formTitle"
              name="formTitle"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-5xl font-extrabold text-slate-800 w-full focus:ring-0 border-none p-2 -ml-2"
              placeholder="Untitled Form"
            />
            <button onClick={saveForm} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 whitespace-nowrap w-full md:w-auto mt-4 md:mt-0">
              Save Form
            </button>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                  {questions.map((question, index) => (
                    <QuestionEditor
                      key={question.id}
                      id={question.id}
                      index={index}
                      questionData={question}
                      updateQuestion={updateQuestion}
                      deleteQuestion={deleteQuestion}
                      copyQuestion={copyQuestion}
                      addQuestionBelow={addQuestionBelow}
                    />
                  ))}
              </SortableContext>
          </DndContext>

          <div className="mt-12 p-6 bg-slate-50 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-4 border-2 border-dashed">
              <span className="font-semibold text-slate-600">Add a new question:</span>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={() => addQuestion('Categorize')} className="flex items-center gap-2 px-5 py-3 bg-white border-2 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-100 hover:border-pink-400 transition-all">
                    <FileType size={20} className="text-pink-500" /> Categorize
                </button>
                <button onClick={() => addQuestion('Cloze')} className="flex items-center gap-2 px-5 py-3 bg-white border-2 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-100 hover:border-yellow-400 transition-all">
                    <MessageSquareQuote size={20} className="text-yellow-500" /> Cloze
                </button>
                <button onClick={() => addQuestion('Comprehension')} className="flex items-center gap-2 px-5 py-3 bg-white border-2 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-100 hover:border-purple-400 transition-all">
                    <CheckSquare size={20} className="text-purple-500" /> Comprehension
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
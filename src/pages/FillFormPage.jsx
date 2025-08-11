import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import QuestionViewer from '../components/QuestionViewer';
import { CheckCircle, Loader } from 'lucide-react';

// Premium Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <Loader className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="mt-4 text-lg font-semibold text-slate-600">Loading Your Form...</p>
  </div>
);

// Premium "Test Completed" Screen
const TestCompleted = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-xl">
      <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-slate-800">Test Completed</h1>
      <p className="mt-3 text-lg text-slate-600">Congratulations! Your responses have been recorded.</p>
    </div>
);

const FillFormPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/forms/${formId}`);
          if (!response.ok) throw new Error('Form not found or server error');
          const data = await response.json();
          setForm(data);
  
          const initialAnswers = {};
          data.questions.forEach(q => {
            if (q.questionType === 'Categorize') {
              const shuffledItems = [...q.items].sort(() => Math.random() - 0.5);
              initialAnswers[q._id] = {
                'Uncategorized': shuffledItems.map(item => ({...item})),
                ...q.categories.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {})
              };
            } else if (q.questionType === 'Cloze') {
                const shuffledOptions = [...q.clozeOptions].sort(() => Math.random() - 0.5);
                initialAnswers[q._id] = { optionsBank: shuffledOptions };
            } else {
              initialAnswers[q._id] = {};
            }
          });
          setAnswers(initialAnswers);
  
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchForm();
  }, [formId]);
  const handleAnswerChange = (questionId, newAnswer) => { setAnswers(prev => ({ ...prev, [questionId]: newAnswer })); };
  
  // UPDATED handleSubmit function - validation removed
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // The validation check has been removed from here.

    const cleanedAnswers = {};
    for (const questionId in answers) {
        const answerData = answers[questionId];
        if (form.questions.find(q => q._id === questionId)?.questionType === 'Categorize') {
            cleanedAnswers[questionId] = { ...answerData };
            delete cleanedAnswers[questionId].Uncategorized;
        } else {
            cleanedAnswers[questionId] = answerData;
        }
    }
    try {
        const response = await fetch(`http://localhost:4000/api/forms/${formId}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: cleanedAnswers })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Submission failed');
        }
        setIsSubmitted(true);
    } catch (err) {
        console.error("Submission Error:", err);
        alert(`Error: ${err.message}`);
    }
  };

  const answeredCount = useMemo(() => {
    if (!form) return 0;
    return form.questions.filter(q => {
        const answer = answers[q._id];
        if (!answer || Object.keys(answer).length === 0) return false;
        if (q.questionType === 'Categorize' && answer['Uncategorized']?.length > 0) return false;
        if (q.questionType === 'Cloze' && answer.optionsBank?.length > 0) return false;
        if (q.questionType === 'Comprehension' && (!answer.comprehensionAnswers || answer.comprehensionAnswers.length < q.mcqs.length)) return false;
        return true;
    }).length;
  }, [answers, form]);
  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            {isSubmitted ? (
                <TestCompleted />
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/50">
                            {form.headerImage && <img src={form.headerImage} alt={form.title} className="mb-6 rounded-lg w-full" />}
                            <h1 className="text-5xl font-bold text-slate-800">{form.title}</h1>
                        </div>
                        {form.questions.map((question, index) => (
                            <div id={`question-${index}`} key={question._id}>
                                <QuestionViewer
                                    question={question}
                                    answer={answers[question._id]}
                                    handleAnswerChange={handleAnswerChange}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/50">
                            <h3 className="text-xl font-bold border-b border-slate-200 pb-4">Questions</h3>
                            <div className="py-4 text-base font-medium text-slate-600">
                                <p>Answered: <span className="font-bold text-slate-800">{answeredCount}</span></p>
                                <p>Unanswered: <span className="font-bold text-slate-800">{form.questions.length - answeredCount}</span></p>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {form.questions.map((q, index) => (
                                    <button
                                        type="button"
                                        key={q._id}
                                        onClick={() => scrollToQuestion(index)}
                                        className="h-12 rounded-lg border flex items-center justify-center font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-8 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
                                Submit Form
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
};

export default FillFormPage;
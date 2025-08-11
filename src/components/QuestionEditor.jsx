import React, { useState, useEffect, useMemo } from 'react';
import { FileType, MessageSquareQuote, CheckSquare, Plus, Trash2, ImagePlus, GripVertical, Copy, Underline } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';


// ... (questionIcons, SortableItem, CategorizeEditor, etc. components remain the same as before) ...
const questionIcons = {
    Categorize: <FileType className="text-pink-500" />,
    Cloze: <MessageSquareQuote className="text-yellow-500" />,
    Comprehension: <CheckSquare className="text-purple-500" />,
};
const SortableItem = ({ id, children }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white rounded-md border">
        <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing">
          <GripVertical size={18} className="text-slate-400" />
        </div>
        {children}
      </div>
    );
};
const CategorizeEditor = ({ questionData, updateQuestion }) => {
    const { categories = [], items = [] } = questionData;
    const handleCategoryChange = (index, value) => {
      const newCategories = [...categories];
      newCategories[index] = value;
      updateQuestion(questionData.id, { categories: newCategories });
    };
    const addCategory = () => updateQuestion(questionData.id, { categories: [...categories, `Category ${categories.length + 1}`] });
    const removeCategory = (index) => {
        const newCategories = categories.filter((_, i) => i !== index);
        updateQuestion(questionData.id, { categories: newCategories });
    };
    const handleItemTextChange = (index, value) => {
      const newItems = [...items];
      newItems[index].text = value;
      updateQuestion(questionData.id, { items: newItems });
    };
    const handleItemCategoryChange = (index, category) => {
        const newItems = [...items];
        newItems[index].category = category;
        updateQuestion(questionData.id, { items: newItems });
    };
    const addItem = () => updateQuestion(questionData.id, { items: [...items, { text: `Item ${items.length + 1}`, category: categories[0] || '' }] });
    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        updateQuestion(questionData.id, { items: newItems });
    };
    const handleCategoryDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = categories.findIndex(c => c === active.id);
            const newIndex = categories.findIndex(c => c === over.id);
            updateQuestion(questionData.id, { categories: arrayMove(categories, oldIndex, newIndex) });
        }
    };
    const handleItemDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.text === active.id);
            const newIndex = items.findIndex(item => item.text === over.id);
            updateQuestion(questionData.id, { items: arrayMove(items, oldIndex, newIndex) });
        }
    };
  
    return (
      <div className="mt-4 grid grid-cols-1 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Categories</h4>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {categories.map((cat, index) => (
                            <SortableItem key={index} id={cat}>
                                <input type="text" value={cat} onChange={(e) => handleCategoryChange(index, e.target.value)} placeholder={`Category ${index + 1}`} className="w-full p-2 border-none outline-none focus:ring-0"/>
                                <button onClick={() => removeCategory(index)} className="p-2 text-slate-500 hover:text-red-600 rounded-md"><Trash2 size={18} /></button>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
          <button onClick={addCategory} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"><Plus size={16} /> Add Category</button>
        </div>
  
        <div>
          <div className="grid grid-cols-2 font-semibold mb-2">
              <h4>Item</h4>
              <h4>Belongs To</h4>
          </div>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
                <SortableContext items={items.map(i => i.text)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <SortableItem key={index} id={item.text}>
                                <div className="grid grid-cols-2 gap-4 w-full items-center">
                                    <input type="text" value={item.text} onChange={(e) => handleItemTextChange(index, e.target.value)} placeholder={`Item ${index + 1}`} className="border-none outline-none focus:ring-0"/>
                                    <select value={item.category} onChange={(e) => handleItemCategoryChange(index, e.target.value)} className="p-2 border border-slate-300 rounded-md shadow-sm">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <button onClick={() => removeItem(index)} className="p-2 text-slate-500 hover:text-red-600 rounded-md"><Trash2 size={18} /></button>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
          <button onClick={addItem} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"><Plus size={16} /> Add Item</button>
        </div>
      </div>
    );
};
const ClozeEditor = ({ questionData, updateQuestion }) => {
    const { clozeSentence = '', clozeOptions = [] } = questionData;
    const [extraOption, setExtraOption] = useState('');
    const editor = useEditor({
        extensions: [StarterKit, TiptapUnderline],
        content: clozeSentence,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            updateQuestion(questionData.id, { clozeSentence: html });
        },
    });
    const previewText = useMemo(() => {
        if (!clozeSentence) return '...';
        const strippedHtml = clozeSentence.replace(/<u>/g, '____').replace(/<\/u>/g, '');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = strippedHtml;
        return tempDiv.textContent || tempDiv.innerText || '';
    }, [clozeSentence]);

    useEffect(() => {
        if (!editor) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(editor.getHTML(), 'text/html');
        const underlinedWords = Array.from(doc.querySelectorAll('u')).map(u => u.textContent.trim()).filter(Boolean);
        const correctOptions = underlinedWords.map(text => ({ text, isCorrect: true }));
        const distractorOptions = clozeOptions.filter(opt => !opt.isCorrect);
        const newOptions = [...correctOptions, ...distractorOptions];
        if (JSON.stringify(newOptions) !== JSON.stringify(clozeOptions)) {
            updateQuestion(questionData.id, { clozeOptions: newOptions });
        }
    }, [clozeSentence, editor]);

    const addExtraOption = () => {
        if (extraOption.trim() === '') return;
        const newOption = { text: extraOption, isCorrect: false };
        updateQuestion(questionData.id, { clozeOptions: [...clozeOptions, newOption] });
        setExtraOption('');
    };
    
    const removeOption = (index) => {
        const newOptions = clozeOptions.filter((_, i) => i !== index);
        updateQuestion(questionData.id, { clozeOptions: newOptions });
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = clozeOptions.findIndex(opt => opt.text === active.id);
            const newIndex = clozeOptions.findIndex(opt => opt.text === over.id);
            updateQuestion(questionData.id, { clozeOptions: arrayMove(clozeOptions, oldIndex, newIndex) });
        }
    };
    const TiptapToolbar = ({ editor }) => {
        if (!editor) return null;
        return (
            <div className="border border-b-0 border-slate-300 rounded-t-lg p-2 bg-slate-50">
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded-md ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'hover:bg-slate-200'}`}
                    type="button" >
                    <Underline size={18} />
                </button>
            </div>
        );
    };

    return (
        <div className="mt-4 space-y-6">
            <div>
                <label className="font-semibold block mb-2">Preview</label>
                <div className="w-full p-3 border border-slate-300 rounded-md bg-slate-100 text-slate-600 min-h-[50px]">
                    {previewText}
                </div>
            </div>
            <div>
                <label className="font-semibold block mb-2">Sentence</label>
                <div className="tiptap-editor">
                    <style>{`.tiptap p { margin: 0; } .tiptap:focus { outline: none; }`}</style>
                    <TiptapToolbar editor={editor} />
                    <EditorContent editor={editor} className="border border-slate-300 p-3 rounded-b-lg min-h-[120px]" />
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Options</h4>
                <p className="text-sm text-slate-500 mb-2">Correct answers are generated automatically. You can add incorrect "distractor" options and drag to reorder.</p>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={clozeOptions.map(o => o.text)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {clozeOptions.map((opt, index) => (
                                <SortableItem key={index} id={opt.text}>
                                    <input 
                                        type="checkbox" 
                                        checked={opt.isCorrect} 
                                        disabled
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`w-full p-2 ${opt.isCorrect ? 'text-green-700 font-semibold' : ''}`}>
                                        {opt.text}
                                    </span>
                                    {!opt.isCorrect && (
                                        <button onClick={() => removeOption(index)} className="p-2 text-slate-500 hover:text-red-600 rounded-md"><Trash2 size={18} /></button>
                                    )}
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                
                <div className="flex items-center gap-2 mt-4">
                    <input type="text" value={extraOption} onChange={(e) => setExtraOption(e.target.value)} placeholder="Add a distractor option" />
                    <button onClick={addExtraOption} type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md whitespace-nowrap">Add</button>
                </div>
            </div>
        </div>
    );
};
const ComprehensionEditor = ({ questionData, updateQuestion }) => {
    const { passage = '', mcqs = [] } = questionData;
    const handlePassageChange = (e) => {
      updateQuestion(questionData.id, { passage: e.target.value });
    };
    const handleMCQChange = (mcqIndex, field, value) => {
      const newMCQs = [...mcqs];
      newMCQs[mcqIndex][field] = value;
      updateQuestion(questionData.id, { mcqs: newMCQs });
    };
    const handleOptionChange = (mcqIndex, optIndex, value) => {
      const newMCQs = [...mcqs];
      newMCQs[mcqIndex].options[optIndex] = value;
      updateQuestion(questionData.id, { mcqs: newMCQs });
    };
    const handleCorrectAnswerChange = (mcqIndex, optIndex) => {
        const newMCQs = [...mcqs];
        newMCQs[mcqIndex].correctAnswer = optIndex;
        updateQuestion(questionData.id, { mcqs: newMCQs });
    };
    const addMCQ = () => {
      const newMCQs = [...mcqs, { question: '', options: [''], correctAnswer: 0 }];
      updateQuestion(questionData.id, { mcqs: newMCQs });
    };
    const addOption = (mcqIndex) => {
        const newMCQs = [...mcqs];
        newMCQs[mcqIndex].options.push('');
        updateQuestion(questionData.id, { mcqs: newMCQs });
    };
    const removeMCQ = (mcqIndex) => {
      const newMCQs = mcqs.filter((_, i) => i !== mcqIndex);
      updateQuestion(questionData.id, { mcqs: newMCQs });
    };
  
    return (
      <div className="mt-4 space-y-6">
        <div>
          <label className="font-semibold block mb-2">Passage</label>
          <textarea value={passage} onChange={handlePassageChange} placeholder="Enter the comprehension passage here..." rows="8"/>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Multiple Choice Questions</h4>
          <div className="space-y-4">
            {mcqs.map((mcq, mcqIndex) => (
              <div key={mcqIndex} className="p-4 border border-slate-200 rounded-lg bg-white">
                <div className="flex justify-between items-start">
                  <label className="font-medium text-slate-700">Question {mcqIndex + 1}</label>
                  <button onClick={() => removeMCQ(mcqIndex)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md"><Trash2 size={18} /></button>
                </div>
                <div className="mt-2 space-y-2">
                  <input type="text" value={mcq.question} onChange={(e) => handleMCQChange(mcqIndex, 'question', e.target.value)} placeholder="MCQ Question Text" />
                  <div className="pl-4 space-y-2">
                    <label className="text-sm font-medium text-slate-600">Options (select the correct one):</label>
                    {mcq.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name={`correct-answer-${mcqIndex}`}
                            checked={mcq.correctAnswer === optIndex}
                            onChange={() => handleCorrectAnswerChange(mcqIndex, optIndex)}
                        />
                        <input type="text" value={opt} onChange={(e) => handleOptionChange(mcqIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`}/>
                      </div>
                    ))}
                     <button onClick={() => addOption(mcqIndex)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"><Plus size={16} /> Add Option</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addMCQ} className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"><Plus size={16} /> Add MCQ</button>
        </div>
      </div>
    );
};

// ====================================================================
// ## Main Question Editor Component
// ====================================================================
const QuestionEditor = ({ id, index, questionData, updateQuestion, deleteQuestion, copyQuestion, addQuestionBelow }) => {
  const [isImageInputVisible, setIsImageInputVisible] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition: transition || 'transform 250ms ease' };

  // ... (All handler funct

  const handleTitleChange = (e) => {
    updateQuestion(questionData.id, { questionTitle: e.target.value });
  };
  
  const handleImageChange = (e) => {
    updateQuestion(questionData.id, { image: e.target.value });
  };

  const handlePointsChange = (e) => {
    const newPoints = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    updateQuestion(questionData.id, { points: newPoints });
  };

  const renderQuestionFields = () => {
    switch (questionData.questionType) {
        case 'Categorize':
          return <CategorizeEditor questionData={questionData} updateQuestion={updateQuestion} />;
        case 'Cloze':
          return <ClozeEditor questionData={questionData} updateQuestion={updateQuestion} />;
        case 'Comprehension':
          return <ComprehensionEditor questionData={questionData} updateQuestion={updateQuestion} />;
        default:
          return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group my-8 transition-shadow duration-300 hover:shadow-2xl rounded-2xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-slate-200">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 p-2 rounded-full hover:bg-slate-200 transition-colors">
                    <GripVertical size={20} />
                </div>
                <span className="font-bold text-slate-700 text-lg">Question {index + 1}</span>
            </div>
            
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        {questionIcons[questionData.questionType]}
                        <h3 className="text-xl font-bold text-slate-800">{questionData.questionType}</h3>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <label className="font-semibold text-sm text-slate-600 block mb-1">Points</label>
                        <input type="number" value={questionData.points} onChange={handlePointsChange} className="w-24 p-2 text-center" min="0" />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <input type="text" placeholder="Question Title (Optional)" value={questionData.questionTitle} onChange={handleTitleChange} className="text-lg font-semibold" />
                    
                    {isImageInputVisible && (
                        <input type="text" placeholder="Paste image URL here..." value={questionData.image || ''} onChange={handleImageChange} />
                    )}
                    {questionData.image && (
                        <div className="mt-4"><img src={questionData.image} alt="Question preview" className="rounded-md max-h-48 w-auto" /></div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-200">
                {renderQuestionFields()}
            </div>
        </div>

        <div className="absolute top-1/2 -right-5 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
            <button onClick={() => setIsImageInputVisible(prev => !prev)} className="p-3 bg-white rounded-full shadow-lg border hover:bg-slate-100 transition-transform hover:scale-110"><ImagePlus size={18} /></button>
            <button onClick={() => addQuestionBelow(index, questionData.questionType)} className="p-3 bg-white rounded-full shadow-lg border hover:bg-slate-100 transition-transform hover:scale-110"><Plus size={18} /></button>
            <button onClick={() => copyQuestion(id)} className="p-3 bg-white rounded-full shadow-lg border hover:bg-slate-100 transition-transform hover:scale-110"><Copy size={18} /></button>
            <button onClick={() => deleteQuestion(id)} className="p-3 bg-white rounded-full shadow-lg border hover:bg-red-100 text-red-600 transition-transform hover:scale-110"><Trash2 size={18} /></button>
        </div>
    </div>
  );
};

export default QuestionEditor;

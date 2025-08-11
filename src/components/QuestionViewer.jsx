import React from 'react';
import { DndContext, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';

// ======= Reusable Draggable Item =======
const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 rounded-lg bg-white text-slate-700 font-semibold touch-none cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
        >
            {children}
        </div>
    );
};

// ======= Reusable Droppable Area =======
const DroppableCategory = ({ id, children, label }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`p-4 rounded-xl w-full min-h-[80px] flex flex-wrap gap-3 items-center transition-all duration-200 ${
                isOver ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-100 border border-dashed'
            }`}
        >
            {children.length === 0 && <span className="text-sm font-medium text-slate-500">{label}</span>}
            {children}
        </div>
    );
};

// ======= Cloze Blank Component =======
const ClozeBlank = ({ id, droppedItem }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`inline-block align-middle w-40 h-14 p-1 rounded-lg transition-colors border-2 border-dashed ${
                isOver ? 'bg-blue-100 border-blue-400' : 'bg-slate-100 border-slate-300'
            }`}
        >
            {droppedItem && <DraggableItem id={droppedItem.text}>{droppedItem.text}</DraggableItem>}
        </div>
    );
};

const QuestionViewer = ({ question, answer, handleAnswerChange }) => {
    const renderQuestionType = () => {
        switch (question.questionType) {
            // ================= Categorize =================
            case 'Categorize': {
                const handleCategorizeDragEnd = ({ active, over }) => {
                    if (!over) return;
                    const sourceCategory = Object.keys(answer).find(key =>
                        answer[key].some(item => item.text === active.id)
                    );
                    const destCategory = over.id;
                    if (sourceCategory && destCategory && sourceCategory !== destCategory) {
                        const sourceItems = [...answer[sourceCategory]];
                        const destItems = [...answer[destCategory]];
                        const itemIndex = sourceItems.findIndex(item => item.text === active.id);
                        const [movedItem] = sourceItems.splice(itemIndex, 1);
                        destItems.push(movedItem);
                        handleAnswerChange(question._id, {
                            ...answer,
                            [sourceCategory]: sourceItems,
                            [destCategory]: destItems,
                        });
                    }
                };
                return (
                    <DndContext onDragEnd={handleCategorizeDragEnd} collisionDetection={closestCorners}>
                        <div className="space-y-6">
                            {Object.keys(answer).map(categoryId => (
                                <div key={categoryId}>
                                    <h4 className="text-lg font-bold text-slate-700 text-center mb-3">{categoryId}</h4>
                                    <DroppableCategory id={categoryId} label={`Drop items for ${categoryId} here...`}>
                                        {answer[categoryId].map(item => (
                                            <DraggableItem key={item.text} id={item.text}>
                                                {item.text}
                                            </DraggableItem>
                                        ))}
                                    </DroppableCategory>
                                </div>
                            ))}
                        </div>
                    </DndContext>
                );
            }

            // ================= Cloze =================
            case 'Cloze': {
                const sentenceHTML = question.clozeSentence || '';
                const sentenceParts = sentenceHTML.replace(/<p>|<\/p>/g, '').split(/(<u>.*?<\/u>)/g).filter(Boolean);

                // Generate stable IDs once per question
                const blanks = React.useMemo(() => {
                    let count = 0;
                    return sentenceParts.map((part) =>
                        part.startsWith('<u>')
                            ? { type: 'blank', id: `blank-${count++}` }
                            : { type: 'text', content: part }
                    );
                }, [sentenceHTML]);

                const handleClozeDragEnd = ({ active, over }) => {
                    if (!over) return;

                    const activeId = active.id;
                    const overId = over.id;

                    handleAnswerChange(question._id, prevAnswer => {
                        const newAnswerState = { ...prevAnswer };
                        let movedItem = null;

                        // Remove from source
                        for (const key in newAnswerState) {
                            if (Array.isArray(newAnswerState[key])) {
                                const idx = newAnswerState[key].findIndex(item => item.text === activeId);
                                if (idx > -1) {
                                    [movedItem] = newAnswerState[key].splice(idx, 1);
                                    break;
                                }
                            }
                        }
                        if (!movedItem) return prevAnswer;

                        // If blank already has item, return it to bank
                        if (overId.startsWith('blank-') && newAnswerState[overId]?.length > 0) {
                            const returned = newAnswerState[overId].pop();
                            newAnswerState.optionsBank.push(returned);
                        }

                        if (!newAnswerState[overId]) newAnswerState[overId] = [];
                        newAnswerState[overId].push(movedItem);

                        return newAnswerState;
                    });
                };

                return (
                    <DndContext onDragEnd={handleClozeDragEnd} collisionDetection={closestCorners}>
                        <div className="text-xl flex flex-wrap items-center gap-x-2 gap-y-4 leading-loose font-medium text-slate-800">
                            {blanks.map((part, index) =>
                                part.type === 'blank' ? (
                                    <ClozeBlank
                                        key={part.id}
                                        id={part.id}
                                        droppedItem={answer[part.id] ? answer[part.id][0] : null}
                                    />
                                ) : (
                                    <span key={index} dangerouslySetInnerHTML={{ __html: part.content }} />
                                )
                            )}
                        </div>

                        <h4 className="font-bold text-slate-700 mt-8 mb-3">Word Bank</h4>
                        <DroppableCategory id="optionsBank" label="Drag words from here...">
                            {(answer.optionsBank || []).map(opt => (
                                <DraggableItem key={opt.text} id={opt.text}>
                                    {opt.text}
                                </DraggableItem>
                            ))}
                        </DroppableCategory>
                    </DndContext>
                );
            }

            // ================= Comprehension =================
            case 'Comprehension':
                return (
                    <div>
                        <div className="prose prose-lg max-w-none bg-slate-100 p-6 rounded-xl mb-8">
                            <p>{question.passage}</p>
                        </div>
                        {question.mcqs.map((mcq, mcqIndex) => (
                            <div key={mcqIndex} className="mt-6">
                                <p className="text-lg font-semibold text-slate-800">
                                    {mcqIndex + 1}. {mcq.question}
                                </p>
                                <div className="mt-4 space-y-3">
                                    {mcq.options.map((option, optIndex) => (
                                        <label
                                            key={optIndex}
                                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 cursor-pointer transition-all"
                                        >
                                            <input
                                                type="radio"
                                                name={`${question._id}-${mcqIndex}`}
                                                value={optIndex}
                                                checked={
                                                    answer.comprehensionAnswers &&
                                                    answer.comprehensionAnswers[mcqIndex] === optIndex
                                                }
                                                onChange={() => {
                                                    const newAnswers = answer.comprehensionAnswers
                                                        ? [...answer.comprehensionAnswers]
                                                        : [];
                                                    newAnswers[mcqIndex] = optIndex;
                                                    handleAnswerChange(question._id, {
                                                        comprehensionAnswers: newAnswers,
                                                    });
                                                }}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="text-base font-medium text-slate-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-8 my-6 border border-slate-200/50 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{question.questionTitle || `Question`}</h3>
            {question.description && <p className="text-slate-600 mb-6 text-lg">{question.description}</p>}
            {question.image && (
                <img src={question.image} alt="Question" className="mb-6 rounded-lg max-w-full" />
            )}
            {renderQuestionType()}
        </div>
    );
};

export default QuestionViewer;

import React from 'react';
import { Link } from 'react-router-dom';
import { FileType, MessageSquareQuote, CheckSquare, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const newFormId = 'new';

  const features = [
    {
      name: 'Categorize',
      description: 'Engage users with interactive drag-and-drop sorting questions.',
      icon: FileType,
      color: 'text-pink-400'
    },
    {
      name: 'Cloze',
      description: 'Create dynamic fill-in-the-blank questions with a rich text editor.',
      icon: MessageSquareQuote,
      color: 'text-yellow-400'
    },
    {
      name: 'Comprehension',
      description: 'Test understanding with a passage followed by multiple-choice questions.',
      icon: CheckSquare,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="background-gradient text-white">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Build Interactive Forms</span>
              <span className="block text-blue-400">Like Never Before</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300 sm:text-xl">
              Go beyond simple text boxes. Create engaging quizzes and tests with our powerful form builder, featuring unique question types that capture attention.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid">
                <Link
                  to={`/editor/${newFormId}`}
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform hover:scale-105 md:text-lg"
                >
                  Create Your First Form <ArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">Our Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              A better way to ask questions
            </p>
          </div>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative bg-slate-800/50 p-6 rounded-2xl border border-slate-700 transform transition-transform hover:-translate-y-2">
                  <dt>
                    <div className={`absolute flex items-center justify-center h-12 w-12 rounded-xl bg-slate-700 ${feature.color}`}>
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-bold text-white">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-slate-400">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
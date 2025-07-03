
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Award, AlertCircle } from "lucide-react";

interface ExamQuestion {
  question: string;
  options: {
    text: string;
    correct: boolean;
  }[];
}

interface ExamSlideProps {
  title: string;
  questions: ExamQuestion[];
  onExamComplete: (score: number, passed: boolean) => void;
}

const ExamSlide: React.FC<ExamSlideProps> = ({ title, questions, onExamComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctAnswers = newAnswers.reduce((acc, answerIndex, questionIndex) => {
        return acc + (questions[questionIndex].options[answerIndex].correct ? 1 : 0);
      }, 0);
      
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const passed = finalScore >= 80;
      
      setScore(finalScore);
      setExamCompleted(true);
      onExamComplete(finalScore, passed);
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  if (examCompleted && !showResults) {
    const passed = score >= 80;
    return (
      <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto text-center px-4">
          Resultado do Exame
        </h2>
        
        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full mb-4 md:mb-6 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <Award className="w-8 h-8 md:w-12 md:h-12 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-red-600" />
            )}
          </div>
          
          <h3 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${
            passed ? 'text-green-600' : 'text-red-600'
          }`}>
            {passed ? 'Parabéns! Você foi aprovado!' : 'Você não atingiu a nota mínima'}
          </h3>
          
          <p className="text-base md:text-lg text-[#52555b] mb-4 md:mb-6">
            Sua pontuação: <span className="font-bold">{score}%</span>
          </p>
          
          <p className="text-sm md:text-base text-[#52555b] mb-4 md:mb-6 px-4">
            {passed 
              ? 'Você demonstrou excelente conhecimento do eGestor e está qualificado como Expert!'
              : 'Você precisa de pelo menos 80% para ser aprovado. Revise o conteúdo e tente novamente.'
            }
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={handleShowResults}
              variant="outline"
              className="w-full border-[#d61c00] text-[#d61c00] hover:bg-[#d61c00] hover:text-white text-sm md:text-base"
            >
              Ver Respostas Detalhadas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto text-center px-4">
          Revisão das Respostas
        </h2>
        
        <div className="space-y-4 md:space-y-6">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
              <h3 className="text-base md:text-lg font-semibold text-[#52555b] mb-3 md:mb-4">
                {questionIndex + 1}. {question.question}
              </h3>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[questionIndex] === optionIndex;
                  const isCorrect = option.correct;
                  
                  let className = 'p-2 md:p-3 rounded border-2 flex items-center justify-between text-sm md:text-base ';
                  
                  if (isCorrect) {
                    className += 'bg-green-100 border-green-500 text-green-800';
                  } else if (isSelected && !isCorrect) {
                    className += 'bg-red-100 border-red-500 text-red-800';
                  } else {
                    className += 'bg-gray-50 border-gray-300 text-gray-600';
                  }
                  
                  return (
                    <div key={optionIndex} className={className}>
                      <span className="pr-2">{option.text}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {isSelected && (
                          <span className="text-xs md:text-sm font-medium">
                            (Sua resposta)
                          </span>
                        )}
                        {isCorrect ? (
                          <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                        ) : isSelected ? (
                          <X className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <p className="text-base md:text-lg font-semibold text-[#52555b]">
            Pontuação Final: {score}% ({answers.filter((answer, index) => 
              questions[index].options[answer].correct
            ).length} de {questions.length} questões corretas)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto">
          {title}
        </h2>
        <div className="text-sm md:text-base text-[#52555b] font-opensans">
          Questão {currentQuestion + 1} de {questions.length}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border">
        <h3 className="text-lg md:text-xl font-semibold text-[#52555b] mb-4 md:mb-6">
          {questions[currentQuestion].question}
        </h3>
        
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={`w-full p-3 md:p-4 text-left border-2 rounded-lg transition-all duration-200 text-sm md:text-base ${
                selectedOption === index 
                  ? 'bg-[#d61c00] text-white border-[#d61c00]' 
                  : 'bg-white border-gray-300 hover:border-[#d61c00] hover:bg-gray-50'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={selectedOption === null}
          className="w-full bg-[#d61c00] hover:bg-[#b01800] text-white font-opensans text-sm md:text-base py-2 md:py-3"
        >
          {currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Exame'}
        </Button>
      </div>
      
      <div className="bg-gray-200 rounded-full h-2 mx-4">
        <div 
          className="bg-[#d61c00] h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ExamSlide;

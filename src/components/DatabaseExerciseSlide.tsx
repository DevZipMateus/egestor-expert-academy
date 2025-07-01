
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface DatabaseExerciseSlideProps {
  title: string;
  question: string;
  options: Array<{
    text: string;
    correct: boolean;
  }>;
  explanation?: string;
  onAnswer: (correct: boolean) => void;
}

const DatabaseExerciseSlide: React.FC<DatabaseExerciseSlideProps> = ({ 
  title, 
  question, 
  options, 
  explanation, 
  onAnswer 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = options[selectedOption].correct;
    setShowResult(true);
    setAnswered(true);
    onAnswer(isCorrect);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedOption === index 
        ? 'bg-[#d61c00] text-white border-[#d61c00]' 
        : 'bg-white border-gray-300 hover:border-[#d61c00] hover:bg-gray-50';
    }
    
    if (options[index].correct) {
      return 'bg-green-100 border-green-500 text-green-800';
    } else if (selectedOption === index && !options[index].correct) {
      return 'bg-red-100 border-red-500 text-red-800';
    }
    
    return 'bg-gray-100 border-gray-300 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#52555b] font-roboto text-center">
        {title}
      </h2>
      <div className="bg-white rounded-lg p-8 shadow-sm border">
        <h3 className="text-xl font-semibold text-[#52555b] mb-6 font-opensans">
          {question}
        </h3>
        
        <div className="space-y-4 mb-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={answered}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 flex items-center justify-between ${getOptionStyle(index)}`}
            >
              <span className="font-opensans">{option.text}</span>
              {showResult && (
                <div className="ml-4">
                  {option.correct ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : selectedOption === index ? (
                    <X className="w-5 h-5 text-red-600" />
                  ) : null}
                </div>
              )}
            </button>
          ))}
        </div>

        {!answered && (
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="w-full bg-[#d61c00] hover:bg-[#b01800] text-white font-opensans"
          >
            Responder
          </Button>
        )}

        {showResult && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              options[selectedOption!].correct 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-red-100 border border-red-300'
            }`}>
              <p className={`font-semibold ${
                options[selectedOption!].correct ? 'text-green-800' : 'text-red-800'
              }`}>
                {options[selectedOption!].correct ? '✅ Correto!' : '❌ Incorreto!'}
              </p>
              {!options[selectedOption!].correct && (
                <p className="text-sm text-red-700 mt-2">
                  A resposta correta é: {options.find(opt => opt.correct)?.text}
                </p>
              )}
            </div>

            {explanation && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 font-opensans">Explicação:</h4>
                <p className="text-blue-700 text-sm font-opensans leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseExerciseSlide;

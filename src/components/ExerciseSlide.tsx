import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ExerciseSlideProps {
  title: string;
  question: string;
  options: {
    text: string;
    correct: boolean;
  }[];
  explanation?: string;
  onAnswer: (correct: boolean) => void;
}

const ExerciseSlide: React.FC<ExerciseSlideProps> = ({ title, question, options, explanation, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    console.log('🎯 Opção selecionada:', index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = options[selectedOption].correct;
    console.log('📝 Submetendo resposta:', selectedOption, 'Correta:', isCorrect);
    
    setShowResult(true);
    setAnswered(true);
    
    // Chama onAnswer imediatamente após definir os estados
    onAnswer(isCorrect);
    console.log('✅ onAnswer chamado com:', isCorrect);
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
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto text-center px-4">
        {title}
      </h2>
      <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border mx-auto max-w-4xl">
        <h3 className="text-lg md:text-xl font-semibold text-[#52555b] mb-4 md:mb-6 font-opensans">
          {question}
        </h3>
        
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={answered}
              className={`w-full p-3 md:p-4 text-left border-2 rounded-lg transition-all duration-200 flex items-start justify-between ${getOptionStyle(index)} text-sm md:text-base`}
            >
              <span className="font-opensans pr-2">{option.text}</span>
              {showResult && (
                <div className="ml-2 flex-shrink-0">
                  {option.correct ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  ) : selectedOption === index ? (
                    <X className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
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
            className="w-full bg-[#d61c00] hover:bg-[#b01800] text-white font-opensans text-sm md:text-base py-2 md:py-3"
          >
            Responder
          </Button>
        )}

        {showResult && (
          <div className="space-y-3 md:space-y-4">
            <div className={`p-3 md:p-4 rounded-lg ${
              options[selectedOption!].correct 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-red-100 border border-red-300'
            }`}>
              <p className={`font-semibold text-sm md:text-base ${
                options[selectedOption!].correct ? 'text-green-800' : 'text-red-800'
              }`}>
                {options[selectedOption!].correct ? '✅ Correto!' : '❌ Incorreto!'}
              </p>
              {!options[selectedOption!].correct && (
                <p className="text-xs md:text-sm text-red-700 mt-2">
                  A resposta correta é: {options.find(opt => opt.correct)?.text}
                </p>
              )}
            </div>

            {explanation && (
              <div className="bg-blue-50 border border-blue-200 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 font-opensans text-sm md:text-base">Explicação:</h4>
                <p className="text-blue-700 text-xs md:text-sm font-opensans leading-relaxed">
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

export default ExerciseSlide;


import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExamQuestion {
  id: string;
  question: string;
  options: { text: string; correct: boolean }[];
}

interface ExamSlideProps {
  title: string;
  getExamQuestions: () => Promise<ExamQuestion[]>;
  onExamComplete: (score: number, passed: boolean, answers: any[]) => void;
  timeLimit?: number | null; // Time limit in minutes
}

const ExamSlide: React.FC<ExamSlideProps> = ({ title, getExamQuestions, onExamComplete, timeLimit }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // em segundos

  useEffect(() => {
    const loadQuestions = async () => {
      const examQuestions = await getExamQuestions();
      setQuestions(examQuestions);
      setAnswers(new Array(examQuestions.length).fill(null));
      setLoading(false);
      
      // Iniciar timer se houver limite de tempo
      if (timeLimit && timeLimit > 0) {
        setTimeRemaining(timeLimit * 60); // converter minutos para segundos
      }
    };
    loadQuestions();
  }, [timeLimit]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || examCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Tempo acabou - submeter automaticamente
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examCompleted]);

  const handleTimeUp = () => {
    if (examCompleted) return;
    
    toast.warning("Tempo esgotado! O exame será enviado automaticamente.");
    
    // Calcular score com as respostas atuais
    const correctAnswers = answers.filter((answer, index) => 
      answer !== null && questions[index]?.options[answer]?.correct
    ).length;
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = finalScore >= 80;
    
    // Preparar respostas para salvar no banco
    const formattedAnswers = answers.map((answerIndex, questionIndex) => ({
      question_id: questions[questionIndex]?.id || '',
      selected_option: answerIndex,
      correct: answerIndex !== null ? (questions[questionIndex]?.options[answerIndex]?.correct || false) : false
    }));
    
    setScore(finalScore);
    setExamCompleted(true);
    onExamComplete(finalScore, passed, formattedAnswers);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      toast.error("Por favor, selecione uma resposta antes de continuar.");
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(newAnswers[currentQuestion + 1]);
    } else {
      // Calcular score
      const correctAnswers = newAnswers.filter((answer, index) => 
        answer !== null && questions[index].options[answer]?.correct
      ).length;
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      const passed = finalScore >= 80;
      
      // Preparar respostas para salvar no banco
      const formattedAnswers = newAnswers.map((answerIndex, questionIndex) => ({
        question_id: questions[questionIndex].id,
        selected_option: answerIndex,
        correct: answerIndex !== null ? (questions[questionIndex].options[answerIndex]?.correct || false) : false
      }));
      
      setScore(finalScore);
      setExamCompleted(true);
      onExamComplete(finalScore, passed, formattedAnswers);
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando exame...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-800">Nenhuma pergunta disponível para o exame.</p>
      </div>
    );
  }

  // Função para converter índice em letra (0 = A, 1 = B, 2 = C, 3 = D)
  const indexToLetter = (index: number | null) => {
    if (index === null) return '-';
    return String.fromCharCode(65 + index); // 65 = 'A' em ASCII
  };

  const handleRetry = () => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setSelectedOption(null);
    setExamCompleted(false);
    setScore(0);
    setShowResults(false);
    if (timeLimit && timeLimit > 0) {
      setTimeRemaining(timeLimit * 60);
    }
  };

  if (examCompleted && !showResults) {
    const passed = score >= 80;
    const correctCount = answers.filter((answer, index) => 
      answer !== null && questions[index]?.options[answer]?.correct
    ).length;

    return (
      <div className="space-y-6 max-w-2xl mx-auto px-4">
        {/* Título e subtítulo */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#52555b] font-roboto">
            Você respondeu a todas as questões
          </h2>
          <p className="text-gray-500 mt-2 font-opensans">
            Se quiser, pode voltar e rever suas respostas.
          </p>
        </div>
        
        {/* Resultado em porcentagem */}
        <div className="text-center">
          <p className="text-lg font-opensans">
            Sua nota: <span className={`font-bold text-3xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {score}%
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {correctCount} de {questions.length} questões corretas • Mínimo para aprovação: 80%
          </p>
        </div>
        
        {/* Gabarito compacto */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-center font-semibold mb-4 text-[#52555b]">Gabarito</h3>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer !== null && question.options[userAnswer]?.correct;
              const letter = indexToLetter(userAnswer);
              
              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center justify-center w-10 h-12 md:w-12 md:h-14 rounded-lg border-2 transition-all ${
                    isCorrect 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-red-100 border-red-500 text-red-700'
                  }`}
                >
                  <span className="text-[10px] md:text-xs text-gray-500">{index + 1}</span>
                  <span className="font-bold text-base md:text-lg">{letter}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {passed ? (
            <>
              <Button className="bg-[#d61c00] hover:bg-[#b01800] text-white px-8">
                <Award className="w-4 h-4 mr-2" />
                Receber certificado
              </Button>
              <Button 
                variant="outline"
                className="border-[#d61c00] text-[#d61c00] hover:bg-[#d61c00] hover:text-white px-8"
                onClick={handleShowResults}
              >
                Ver respostas detalhadas
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-[#d61c00] hover:bg-[#b01800] text-white px-8"
                onClick={handleRetry}
              >
                Tentar novamente
              </Button>
              <Button 
                variant="outline"
                className="border-[#d61c00] text-[#d61c00] hover:bg-[#d61c00] hover:text-white px-8"
                onClick={handleShowResults}
              >
                Ver respostas detalhadas
              </Button>
            </>
          )}
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
          {questions.map((question, questionIndex) => {
            const userAnswer = answers[questionIndex];
            return (
              <div key={questionIndex} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
                <h3 className="text-base md:text-lg font-semibold text-[#52555b] mb-3 md:mb-4">
                  {questionIndex + 1}. {question.question}
                </h3>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = userAnswer === optionIndex;
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
            );
          })}
        </div>
        
        <div className="text-center bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <p className="text-base md:text-lg font-semibold text-[#52555b]">
            Pontuação Final: {score}% ({answers.filter((answer, index) => 
              answer !== null && questions[index].options[answer].correct
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
        <div className="flex items-center gap-4">
          {timeRemaining !== null && timeRemaining > 0 && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <div className="text-sm md:text-base text-[#52555b] font-opensans">
            Questão {currentQuestion + 1} de {questions.length}
          </div>
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

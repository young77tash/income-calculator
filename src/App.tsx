import { useEffect, useState } from "react";

type ExchangeRate = {
  rate: number;
  exchangedate: string;
};

function App() {
  const [total, setTotal] = useState(() => localStorage.getItem("total") || "");

  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function getRate() {
      try {
        const response = await fetch(
          "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Ошибка загрузки курса");
        }

        const data: ExchangeRate[] = await response.json();

        if (!data.length || !Number.isFinite(data[0].rate)) {
          throw new Error("Некорректный курс");
        }

        setRate(data[0].rate);
        setDate(data[0].exchangedate);
        setError(false);
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      }
    }

    getRate();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    localStorage.setItem("total", total);
  }, [total]);

  const income = Math.max(0, Number(total) || 0) * 0.4;
  const incomeUAH = rate === null ? null : income * rate;

  const format = (value: number) =>
    value.toLocaleString("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="min-h-screen bg-[#202124] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-9">
          <div className="bg-[#354638] rounded-xl p-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b5ddb5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="6" width="18" height="15" rx="2" />
              <path d="M3 10h18M7 6V4a1 1 0 0 1 1-1h10" />
              <path d="M16 15h2" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-semibold">Income Calculator</h1>
            <p className="text-sm text-gray-400">Твой заработок за работу</p>
          </div>
        </div>

        {/* Поле ввода */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-2">
            Total income
          </label>

          <div className="flex items-center bg-[#303234] border border-[#494b4c] rounded-xl px-4 focus-within:border-[#91b18f] transition-colors">
            <input
              type="text"
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent py-4 text-xl outline-none min-w-0"
            />

            <span className="text-gray-400 font-medium ml-3">USD</span>
          </div>
        </div>

        {/* Главный результат */}
        <div className="bg-[#2c332e] rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-[#b9c6ba]">Твой чистый заработок</p>

            <span className="bg-[#3b5140] text-[#b5ddb5] text-xs font-medium px-3 py-1 rounded-full">
              40%
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#c1e7bb] break-words">
            {incomeUAH === null ? "—" : `${format(incomeUAH)} ₴`}
          </h2>

          <div className="border-t border-[#465148] mt-6 pt-4 flex justify-between items-center gap-3">
            <span className="text-sm text-[#aeb9af]">В долларах</span>

            <span className="text-base font-medium text-[#e0e7df]">
              {format(income)} $
            </span>
          </div>
        </div>

        {/* Курс НБУ */}
        <div className="flex items-start justify-between gap-4 mt-5 px-1 text-sm">
          <span className="text-gray-400">Курс НБУ</span>

          <div className="text-right">
            {error ? (
              <p className="text-red-400">Не удалось загрузить курс</p>
            ) : rate === null ? (
              <p className="text-gray-400">Загрузка...</p>
            ) : (
              <>
                <p className="text-gray-300">1 USD = {format(rate)} ₴</p>
                <p className="text-xs text-gray-500 mt-1">На {date}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

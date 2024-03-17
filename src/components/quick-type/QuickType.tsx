import { useCallback, useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  MinusOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { App, Typography, InputNumber, FloatButton, Checkbox } from "antd";
import { Timer } from "../shared";
const { Title } = Typography;
import type { CheckboxProps } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";

type GameStatus = "active" | "passed" | "failed";

function QuickType() {
  const [code, setCode] = useState(generateCode(12));
  const [activeIndex, setActiveIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("active");

  const [showControlPanel, setShowControlPanel] = useState(false);

  const [timerKey, setTimerKey] = useState(crypto.randomUUID());
  const [timerDuration, setTimerDuration] = useState(7);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const { message } = App.useApp();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus !== "active") return;
      if (e.key.toLowerCase() !== code[activeIndex].toLowerCase()) {
        message.error("You lose.");
        setGameStatus("failed");
      } else {
        if (activeIndex === code.length - 1) {
          message.success("You win!");
          setGameStatus("passed");
        }
        setActiveIndex((prevIndex) => prevIndex + 1);
      }
    },
    [activeIndex, code, gameStatus, message],
  );

  const handleTimerEnd = useCallback(() => {
    message.error("You lose.");
    setGameStatus("failed");
  }, [message]);

  const handleTimerToggle: CheckboxProps["onChange"] = useCallback(
    (e: CheckboxChangeEvent) => {
      setTimerEnabled(e.target.checked);
    },
    [],
  );

  const handleSetTimerDuration = useCallback((duration: number | null) => {
    if (duration === null) return;
    setTimerDuration(duration);
    setTimerKey(crypto.randomUUID());
  }, []);

  const toggleControlPanel = useCallback(() => {
    setShowControlPanel((prev) => !prev);
  }, []);

  const handleGameReset = useCallback(() => {
    setCode(generateCode(12));
    setGameStatus("active");
    setTimerKey(crypto.randomUUID());
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const indicators = Array.from({ length: code.length * 2 - 1 }, (_, i) => {
    return (i + 2) % 2 === 0 ? (
      gameStatus === "failed" &&
      (i === activeIndex * 2 || i === activeIndex * 2 - 1) ? (
        <CloseCircleOutlined
          style={{ color: "#F87374", fontSize: "20px", flexShrink: 0 }}
        />
      ) : i <= (activeIndex - 1) * 2 ? (
        <CheckCircleOutlined
          style={{
            color: "#01DFAF",
            fontSize: "20px",
            flexShrink: 0,
          }}
        />
      ) : (
        <MinusCircleOutlined
          style={{
            fontSize: "20px",
            flexShrink: 0,
            color: "gray",
          }}
        />
      )
    ) : (
      <MinusOutlined
        style={{
          color:
            gameStatus === "failed" && i === activeIndex * 2 - 1
              ? "#F87374"
              : i <= (activeIndex - 1) * 2
                ? "#01DFAF"
                : "gray",
          fontSize: "18px",
          margin: "0 1px",
          flexShrink: 0,
        }}
      />
    );
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "540px",
        }}
      >
        {code.map((char, i) => (
          <div
            style={{
              backgroundColor:
                gameStatus === "failed" && activeIndex === i
                  ? "#F87374"
                  : i < activeIndex
                    ? "#01DFAF"
                    : "white",
              padding: "8px 14px 10px",
              borderRadius: "2px",
              boxShadow: "inset 0px -4px 0px 0px rgb(170, 170, 170, .6)",
            }}
          >
            {char.toUpperCase()}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "540px",
          marginTop: "16px",
          marginBottom: "16px",
          padding: "0 8px",
        }}
      >
        {indicators}
      </div>
      {!timerEnabled ? null : (
        <Timer
          key={timerKey}
          duration={timerDuration}
          onTimerEnd={handleTimerEnd}
          isCompleted={gameStatus !== "active"}
        />
      )}
      {!showControlPanel ? null : (
        <div
          className="control-panel"
          style={{
            position: "absolute",
            right: "16px",
            border: "1px solid white",
            padding: "12px",
            bottom: "110px",
            backgroundColor: "rgb(6, 18, 33)",
          }}
        >
          <div>
            <Title
              level={5}
              style={{
                margin: "8px 0 0 0",
                color: "#FFF",
                display: "block",
              }}
            >
              {"Timer"}
            </Title>
            <div>
              <Checkbox checked={timerEnabled} onChange={handleTimerToggle} />
              <InputNumber
                min={5}
                max={1000}
                defaultValue={7}
                onChange={handleSetTimerDuration}
                value={timerDuration}
                disabled={!timerEnabled}
                style={{
                  width: "65px",
                  marginLeft: "8px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <FloatButton
        icon={<SettingOutlined />}
        type="primary"
        tooltip={<div>Settings</div>}
        onClick={toggleControlPanel}
        style={{ right: 24 }}
      />
      <FloatButton
        icon={<UndoOutlined />}
        type="primary"
        tooltip={<div>Reset</div>}
        onClick={handleGameReset}
        style={{ right: 80 }}
      />
    </div>
  );
}

function generateCode(length: number): string[] {
  return crypto.randomUUID().replace("-", "").substring(0, length).split("");
}

export default QuickType;

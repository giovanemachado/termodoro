import React, {useEffect, useState} from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import BigText from 'ink-big-text';
import {ConfirmInput, UnorderedList} from '@inkjs/ui';
import {exec} from 'child_process';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

enum Phases {
	POMODORO,
	SHORTREST,
	REST,
}

const configs = {
	pomodoro: 1500, // 25 min
	shortRest: 300, // 5 min
	rest: 900, // 15 min
	roundsToRest: 3,
};

export default function App() {
	const {exit} = useApp();
	const [seconds, setSeconds] = useState(0);
	const [currentSecondsTarget, setCurrentSecondsTarget] = useState(
		configs.pomodoro,
	);
	const [timerText, setTimerText] = useState('00:00');
	const [totalRounds, setTotalRounds] = useState(1);
	const [rounds, setRounds] = useState(1);
	const [phase, setPhase] = useState(Phases.POMODORO);
	const [phaseText, setPhaseText] = useState('pomodoro');
	const [color, setColor] = useState('green');
	const [showConfirmQuit, setShowConfirmQuit] = useState(false);
	const [showConfirmReset, setShowConfirmReset] = useState(false);
	const [isPaused, setIsPaused] = useState(true);

	// Actions
	useInput(input => {
		switch (input) {
			case 'p':
				pause();
				break;
			case 's':
				skip();
				break;
			case 'r':
				setShowConfirmReset(true);
				break;
			case 'q':
				setShowConfirmQuit(true);
				break;
		}
	});

	const skip = () => {
		goToNextPhase();
	};

	const pause = () => {
		setIsPaused(!isPaused);
	};

	const reset = () => {
		setPhase(Phases.POMODORO);
		setSeconds(0);
		setCurrentSecondsTarget(configs.pomodoro);
		setTotalRounds(0);
	};

	const onConfirmQuit = () => {
		exit();
		setShowConfirmQuit(false);
	};

	const onConfirmReset = () => {
		reset();
		setShowConfirmReset(false);
	};

	const onCancel = () => {
		setShowConfirmQuit(false);
	};

	// Start phases
	const goToNextPhase = () => {
		playSound();
		setIsPaused(true);
		switch (phase) {
			case Phases.POMODORO:
				if (rounds > configs.roundsToRest) {
					setPhaseText('rest');
					startRestPhase();
					break;
				}

				startShortRestPhase();
				setPhaseText('short rest');
				break;
			case Phases.REST:
			case Phases.SHORTREST:
				setPhaseText('pomodoro');
				startPomodoroPhase();
				break;
		}
	};

	const startShortRestPhase = () => {
		setPhase(Phases.SHORTREST);
		setSeconds(0);
		setCurrentSecondsTarget(configs.shortRest);
		setTotalRounds(prevRounds => prevRounds + 1);
		setRounds(prevRounds => prevRounds + 1);
	};

	const startRestPhase = () => {
		setPhase(Phases.REST);
		setSeconds(0);
		setCurrentSecondsTarget(configs.rest);
		setTotalRounds(prevRounds => prevRounds + 1);
		setRounds(1);
	};

	const startPomodoroPhase = () => {
		setPhase(Phases.POMODORO);
		setSeconds(0);
		setCurrentSecondsTarget(configs.pomodoro);
	};

	// Timer
	useEffect(() => {
		let interval: NodeJS.Timer | undefined = undefined;

		if (isPaused) {
			clearInterval(interval);
			return;
		}

		interval = setInterval(() => {
			setSeconds(prevSeconds => prevSeconds + 1);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [isPaused]);

	useEffect(() => {
		if (seconds > currentSecondsTarget) {
			goToNextPhase();
		}

		let minutes = Math.floor(seconds / 60);
		let extraSeconds = seconds % 60;
		let minutesText = minutes < 10 ? '0' + minutes : minutes;
		let extraSecondsText =
			extraSeconds < 10 ? '0' + extraSeconds : extraSeconds;

		setTimerText(minutesText + ':' + extraSecondsText);
	}, [seconds]);

	// Colors
	useEffect(() => {
		setColor(
			phase === Phases.POMODORO
				? 'green'
				: phase === Phases.SHORTREST
				? 'red'
				: 'blue',
		);
	}, [phase]);

	// Util
	const playSound = () => {
		let absolutePath = path.join(
			dirname(fileURLToPath(import.meta.url)),
			'./test.mp3',
		);
		exec('afplay ' + absolutePath, (error, _stdout, _stderr) => {
			// will keep this while testing
			// console.log(stdout);
			// console.log(stderr);
			if (error !== null) {
				console.log(`exec error: ${error}`);
			}
		});
	};

	return (
		<Box flexDirection="column">
			<Box flexDirection="column">
				<BigText font="3d" colors={[color]} text={timerText} />
				<Text>rounds: {totalRounds}</Text>
				<Text>current phase: {phaseText}</Text>
				{isPaused ? <Text color={'red'}>paused</Text> : <Text> </Text>}
			</Box>
			<Text>commands:</Text>
			<UnorderedList>
				<UnorderedList.Item>
					<Text>p - {isPaused ? 'play' : 'pause'}</Text>
				</UnorderedList.Item>
				<UnorderedList.Item>
					<Text>r - reset</Text>
				</UnorderedList.Item>
				<UnorderedList.Item>
					<Text>s - skip to next phase</Text>
				</UnorderedList.Item>
				<UnorderedList.Item>
					<Text>q - quit</Text>
				</UnorderedList.Item>
			</UnorderedList>
			{showConfirmQuit && (
				<>
					<Text bold>Are you sure you wanna quit?</Text>
					<ConfirmInput onConfirm={onConfirmQuit} onCancel={onCancel} />
				</>
			)}
			{showConfirmReset && (
				<>
					<Text bold>Are you sure you wanna reset?</Text>
					<ConfirmInput onConfirm={onConfirmReset} onCancel={onCancel} />
				</>
			)}
		</Box>
	);
}

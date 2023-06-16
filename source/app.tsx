import React, {useEffect, useState} from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import BigText from 'ink-big-text';
import {ConfirmInput, UnorderedList} from '@inkjs/ui';

export default function App() {
	const {exit} = useApp();
	enum Phases {
		POMODORO,
		SHORTREST,
		REST,
	}

	const configs = {
		pomodoro: 15,
		shortRest: 3,
		rest: 9,
		roundsToRest: 2,
	};

	const [seconds, setSeconds] = useState(0);
	const [currentSecondsTarget, setCurrentSecondsTarget] = useState(
		configs.pomodoro,
	);
	const [timerText, setTimerText] = useState('00:00');
	const [rounds, setRounds] = useState(1);
	const [phase, setPhase] = useState(Phases.POMODORO);
	const [color, setColor] = useState('green');
	const [lastInput, setLastInput] = useState('');
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => {
			setSeconds(prevSeconds => prevSeconds + 1);
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, []);

	useEffect(() => {
		if (seconds > currentSecondsTarget) {
			switch (phase) {
				case Phases.POMODORO:
					if (rounds > configs.roundsToRest) {
						// go to rest
						setPhase(Phases.REST);
						setSeconds(0);
						setCurrentSecondsTarget(configs.rest);
						setRounds(1);
						break;
					} else {
						// go to short restc
						setPhase(Phases.SHORTREST);
						setSeconds(0);
						setCurrentSecondsTarget(configs.shortRest);
						setRounds(prevRounds => prevRounds + 1);
					}
					break;
				case Phases.REST:
					setPhase(Phases.POMODORO);
					setSeconds(0);
					setCurrentSecondsTarget(configs.pomodoro);
					break;
				case Phases.SHORTREST:
					setPhase(Phases.POMODORO);
					setSeconds(0);
					setCurrentSecondsTarget(configs.pomodoro);
					break;
			}
		}

		let minutes = Math.floor(seconds / 60);
		let extraSeconds = seconds % 60;
		let minutesText = minutes < 10 ? '0' + minutes : minutes;
		let extraSecondsText =
			extraSeconds < 10 ? '0' + extraSeconds : extraSeconds;

		setTimerText(minutesText + ':' + extraSecondsText);
	}, [seconds]);

	useEffect(() => {
		setColor(
			phase === Phases.POMODORO
				? 'green'
				: phase === Phases.SHORTREST
				? 'red'
				: 'blue',
		);
	}, [phase]);

	useInput(input => {
		switch (input) {
			case 'p':
			case 's':
			case 'r':
			case 'q':
				setLastInput(input);
				setShowConfirm(true);
				break;
		}
	});

	const onConfirm = () => {
		if (lastInput == 'q') {
			exit();
		}

		setShowConfirm(false);
	};

	const onCancel = () => {
		setShowConfirm(false);
	};

	return (
		<Box flexDirection="column">
			<BigText colors={[color]} text={timerText} />
			<Text>commands:</Text>
			<UnorderedList>
				<UnorderedList.Item>
					<Text>p - pause</Text>
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
			{showConfirm && (
				<>
					<Text bold>You pressed {lastInput}. Are you sure?</Text>
					<ConfirmInput onConfirm={onConfirm} onCancel={onCancel} />
				</>
			)}
		</Box>
	);
}

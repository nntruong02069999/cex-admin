import { Button, message } from "antd";
import { every, get } from "lodash";
import { useState } from "react";

import * as fiveDGameServices from '@src/services/5d-game'
import { FiveDGameCompletedRound } from "@src/interfaces/5DGame";
import { SECONDS_TO_DISABLE_SET_RESULT_GAME } from "@src/constants/constants";

interface BtnSetResultProps {
    value: string;
    record: FiveDGameCompletedRound;
    setIsSetResultSuccess: (data: boolean) => void;
    secondsLeft: number;
    isFirstRow: boolean;
    loadingNextRound: boolean;
}

export const BtnSetResult: React.FC<BtnSetResultProps> = (props: BtnSetResultProps) => {
    const { value, record, setIsSetResultSuccess, secondsLeft, isFirstRow, loadingNextRound } = props;
    const [isLoading, setIsLoading] = useState(false);

    const checkParams = (object: any) => {
        return every(object, (value) => value !== null && value !== undefined);
    };

    const isDisabled = isLoading || (secondsLeft <= SECONDS_TO_DISABLE_SET_RESULT_GAME  && isFirstRow) || loadingNextRound

    const set5DGameResult = async () => {
        const params = {
            issueNumber: value,
            A: get(record, "resultDigitA", null),
            B: get(record, "resultDigitB", null),
            C: get(record, "resultDigitC", null),
            D: get(record, "resultDigitD", null),
            E: get(record, "resultDigitE", null),
        };
        if (checkParams(params)) {
            setIsLoading(true);
            const result = await fiveDGameServices.set5DGameResult(params)
            if (result.code === 0) {
                message.success(result?.message)
                setIsLoading(false)
                setIsSetResultSuccess(true)
            } else {
                message.error(result?.message)
                setIsLoading(false);
                setIsSetResultSuccess(false)
            }
        } else {
            message.error("Please enter all points value");
            setIsSetResultSuccess(false)
            return
        }
    };

    return (
        <Button
            type="primary"
            className="is-btn-submit"
            onClick={set5DGameResult}
            disabled={isDisabled}
            loading={isLoading}
        >
            Đặt trước kết quả
        </Button>
    );
};
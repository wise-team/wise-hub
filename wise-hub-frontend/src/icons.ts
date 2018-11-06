import faSpinner from "@fortawesome/fontawesome-free-solid/faSpinner";
import faExclamationCircle from "@fortawesome/fontawesome-free-solid/faExclamationCircle";
import faGithub from "@fortawesome/fontawesome-free-brands/faGithub";
import faCrown from "@fortawesome/fontawesome-free-solid/faCrown";
import faAlignCenter from "@fortawesome/fontawesome-free-solid/faAlignCenter";
import faChessKnight from "@fortawesome/fontawesome-free-solid/faChessKnight";
import faCheck from "@fortawesome/fontawesome-free-solid/faCheck";
import faCircle from "@fortawesome/fontawesome-free-solid/faCircle";
import faColumns from "@fortawesome/fontawesome-free-solid/faColumns";
import faCalendarAlt from "@fortawesome/fontawesome-free-solid/faCalendarAlt";
import faTags from "@fortawesome/fontawesome-free-solid/faTags";
import faFeather from "@fortawesome/fontawesome-free-solid/faFeather";
import faGlobe from "@fortawesome/fontawesome-free-solid/faGlobe";
import faClock from "@fortawesome/fontawesome-free-solid/faClock";
import faBalanceScale from "@fortawesome/fontawesome-free-solid/faBalanceScale";
import faBullhorn from "@fortawesome/fontawesome-free-solid/faBullhorn";
import faHandHoldingUsd from "@fortawesome/fontawesome-free-solid/faHandHoldingUsd";
import faPeopleCarry from "@fortawesome/fontawesome-free-solid/faPeopleCarry";
import faThumbsUp from "@fortawesome/fontawesome-free-solid/faThumbsUp";
import faPlug from "@fortawesome/fontawesome-free-solid/faPlug";
import faChartLine from "@fortawesome/fontawesome-free-solid/faChartLine";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faTrashAlt from "@fortawesome/fontawesome-free-solid/faTrashAlt";
import faBook from "@fortawesome/fontawesome-free-solid/faBook";
import faExternalLinkAlt from "@fortawesome/fontawesome-free-solid/faExternalLinkAlt";
import faTimes  from "@fortawesome/fontawesome-free-solid/faTimes";
import faCaretDown  from "@fortawesome/fontawesome-free-solid/faCaretDown";
import faCaretUp  from "@fortawesome/fontawesome-free-solid/faCaretUp";
import faUsers  from "@fortawesome/fontawesome-free-solid/faUsers";
import faRobot  from "@fortawesome/fontawesome-free-solid/faRobot";

import { Rule } from "steem-wise-core";

export const icons = {
    // generic
    loading: faSpinner,
    error: faExclamationCircle,
    ok: faCheck,
    notice: faCircle,
    add: faPlus,
    delete: faTrashAlt,
    manual: faBook,
    externalLink: faExternalLinkAlt,
    enabled: faCheck,
    disabled: faTimes,
    success: faCheck,
    dropdown: faCaretDown,
    dropup: faCaretUp,
    people: faUsers,
    daemon: faRobot,

    // brands
    github: faGithub,

    // wise related terms
    delegator: faCrown,
    voter: faChessKnight,
    read: faAlignCenter,
    unknownRule: faColumns,
    rule: {
        [Rule.Type.AgeOfPost]: faCalendarAlt,
        [Rule.Type.Authors]: faFeather,
        [Rule.Type.CustomRPC]: faGlobe,
        [Rule.Type.ExpirationDate]: faClock,
        [Rule.Type.FirstPost]: faBullhorn,
        [Rule.Type.Payout]: faHandHoldingUsd,
        [Rule.Type.Tags]: faTags,
        [Rule.Type.Voters]: faPeopleCarry,
        [Rule.Type.VotesCount]: faThumbsUp,
        [Rule.Type.VotingPower]: faPlug,
        [Rule.Type.Weight]: faBalanceScale,
        [Rule.Type.WeightForPeriod]: faChartLine
    } as { [x: string]: any; }
};
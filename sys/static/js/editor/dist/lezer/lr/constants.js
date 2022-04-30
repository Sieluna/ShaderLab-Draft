export var Action;
(function (Action) {
    Action[Action["ReduceFlag"] = 65536] = "ReduceFlag";
    Action[Action["ValueMask"] = 65535] = "ValueMask";
    Action[Action["ReduceDepthShift"] = 19] = "ReduceDepthShift";
    Action[Action["RepeatFlag"] = 131072] = "RepeatFlag";
    Action[Action["GotoFlag"] = 131072] = "GotoFlag";
    Action[Action["StayFlag"] = 262144] = "StayFlag";
})(Action || (Action = {}));
export var StateFlag;
(function (StateFlag) {
    StateFlag[StateFlag["Skipped"] = 1] = "Skipped";
    StateFlag[StateFlag["Accepting"] = 2] = "Accepting";
})(StateFlag || (StateFlag = {}));
export var Specialize;
(function (Specialize) {
    Specialize[Specialize["Specialize"] = 0] = "Specialize";
    Specialize[Specialize["Extend"] = 1] = "Extend";
})(Specialize || (Specialize = {}));
export var Term;
(function (Term) {
    Term[Term["Err"] = 0] = "Err";
})(Term || (Term = {}));
export var Seq;
(function (Seq) {
    Seq[Seq["End"] = 65535] = "End";
    Seq[Seq["Done"] = 0] = "Done";
    Seq[Seq["Next"] = 1] = "Next";
    Seq[Seq["Other"] = 2] = "Other";
})(Seq || (Seq = {}));
export var ParseState;
(function (ParseState) {
    ParseState[ParseState["Flags"] = 0] = "Flags";
    ParseState[ParseState["Actions"] = 1] = "Actions";
    ParseState[ParseState["Skip"] = 2] = "Skip";
    ParseState[ParseState["TokenizerMask"] = 3] = "TokenizerMask";
    ParseState[ParseState["DefaultReduce"] = 4] = "DefaultReduce";
    ParseState[ParseState["ForcedReduce"] = 5] = "ForcedReduce";
    ParseState[ParseState["Size"] = 6] = "Size";
})(ParseState || (ParseState = {}));
export var Encode;
(function (Encode) {
    Encode[Encode["BigValCode"] = 126] = "BigValCode";
    Encode[Encode["BigVal"] = 65535] = "BigVal";
    Encode[Encode["Start"] = 32] = "Start";
    Encode[Encode["Gap1"] = 34] = "Gap1";
    Encode[Encode["Gap2"] = 92] = "Gap2";
    Encode[Encode["Base"] = 46] = "Base";
})(Encode || (Encode = {}));
export var File;
(function (File) {
    File[File["Version"] = 14] = "Version";
})(File || (File = {}));

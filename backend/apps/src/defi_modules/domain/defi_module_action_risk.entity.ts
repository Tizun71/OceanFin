export class DefiModuleActionRisk {
    constructor(
        public readonly id: string,
        public module_action_id: string,
        public risk_type: string,
        public severity: string,
        public description: string
    ) { }
}
import {BitListType, ContainerType} from "@chainsafe/ssz";

import {IPhase0SSZTypes} from "../../phase0";
import * as altair from "../types";

export type IAltairSSZTypes = Omit<
  IPhase0SSZTypes,
  "BeaconBlockBody" | "BeaconBlock" | "SignedBeaconBlock" | "BeaconState"
> & {
  // altair
  SyncCommittee: ContainerType<altair.SyncCommittee>;
  SyncCommitteeSignature: ContainerType<altair.SyncCommitteeSignature>;
  SyncCommiteeBits: BitListType;
  SyncCommitteeContribution: ContainerType<altair.SyncCommitteeContribution>;
  ContributionAndProof: ContainerType<altair.ContributionAndProof>;
  SignedContributionAndProof: ContainerType<altair.SignedContributionAndProof>;
  SyncCommitteeSigningData: ContainerType<altair.SyncCommitteeSigningData>;
  SyncAggregate: ContainerType<altair.SyncAggregate>;
  BeaconBlockBody: ContainerType<altair.BeaconBlockBody>;
  BeaconBlock: ContainerType<altair.BeaconBlock>;
  SignedBeaconBlock: ContainerType<altair.SignedBeaconBlock>;
  BeaconState: ContainerType<altair.BeaconState>;
  LightClientSnapshot: ContainerType<altair.LightClientSnapshot>;
  LightClientUpdate: ContainerType<altair.LightClientUpdate>;
  LightClientStore: ContainerType<altair.LightClientStore>;
};

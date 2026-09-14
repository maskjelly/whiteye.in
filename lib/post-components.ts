import type { ComponentType } from "react"
import PolynomialsPost from "@/content/posts/polynomials-at-the-speed-of-silicon"
import StoragePost from "@/content/posts/your-storage-is-lying-to-you"
import ConsensusPost from "@/content/posts/the-consensus-problem-and-why-raft-exists"
import MemoryPost from "@/content/posts/memory-ordering-is-not-what-you-think"
import BftPost from "@/content/posts/byzantine-fault-tolerance-when-nodes-lie"
import LogPost from "@/content/posts/the-log-is-the-database"
import NetworkPost from "@/content/posts/the-network-is-not-a-wire"
import RushortPost from "@/content/posts/16m-rps-rust-url-shortener"

export const postComponents: Record<string, ComponentType> = {
  "polynomials-at-the-speed-of-silicon": PolynomialsPost,
  "your-storage-is-lying-to-you": StoragePost,
  "the-consensus-problem-and-why-raft-exists": ConsensusPost,
  "memory-ordering-is-not-what-you-think": MemoryPost,
  "byzantine-fault-tolerance-when-nodes-lie": BftPost,
  "the-log-is-the-database": LogPost,
  "the-network-is-not-a-wire": NetworkPost,
  "16m-rps-rust-url-shortener": RushortPost,
}

export function getPostComponent(slug: string): ComponentType | undefined {
  return postComponents[slug]
}

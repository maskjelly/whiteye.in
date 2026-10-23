#!/bin/sh
# Requires a macOS C++ toolchain. Run from the repository root:
# sh scripts/blog-publication-asm.sh /tmp/whiteye-publication-asm
set -eu

publication_output_dir=${1:-${TMPDIR:-/tmp}/whiteye-publication-asm}
mkdir -p "$publication_output_dir"
clang++ --version > "$publication_output_dir/compiler.txt"
clang++ -std=c++20 -O2 -S -target arm64-apple-macos \
  scripts/blog-publication.cpp -o "$publication_output_dir/arm64.s"
clang++ -std=c++20 -O2 -S -target arm64-apple-macos -mcpu=generic \
  scripts/blog-publication.cpp -o "$publication_output_dir/arm64-generic.s"
clang++ -std=c++20 -O2 -S -target x86_64-apple-macos \
  scripts/blog-publication.cpp -o "$publication_output_dir/x86_64.s"

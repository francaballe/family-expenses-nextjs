'use client';

import Link from 'next/link';

interface PathItem {
    name: string;
    icon: string;
    path: string;
    disabled?: boolean;
    summary?: string | null;
}

interface PathListProps {
    paths: PathItem[];
}

export default function PathList({ paths }: PathListProps) {
    return (
        <ul className="space-y-3">
            {paths.map((item) => (
                <li key={item.path}>
                    {item.disabled ? (
                        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                                <span className="font-medium text-gray-500">{item.name}</span>
                                {item.summary && (
                                    <p className="text-sm text-gray-400 mt-1">{item.summary}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={item.path}
                            className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <div>
                                <span className="font-medium text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                                    {item.name}
                                </span>
                                {item.summary && (
                                    <p className="text-sm text-gray-500 mt-1">{item.summary}</p>
                                )}
                            </div>
                            <span className="ml-auto text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                →
                            </span>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
}
